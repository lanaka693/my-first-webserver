aconst http = require('http');
const url = require('url');
const querystring = require('querystring');
// 1. เรียกใชงาน Pool จากไลบรารี pg สําหรับจัดการการเชื่อมตอฐานขอมูล
const { Pool } = require('pg');
// 2. ตั้งคาการเชื่อมตอ โดยดึง URL มาจาก Environment Variable ของ Railway
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const port = process.env.PORT || 3000;

// ฟังก์ชันเพื่อได้ HTML หลัก
async function getMainHTML() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM students ORDER BY student_id');
    client.release();

    let html = `
      <!DOCTYPE html>
      <html lang="th">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ระบบจัดการฐานข้อมูลนักศึกษา</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            padding: 20px;
          }
          .container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          h1 {
            color: #333;
            margin-bottom: 10px;
            text-align: center;
          }
          .subtitle {
            text-align: center;
            color: #666;
            margin-bottom: 30px;
          }
          .form-section {
            background: #f9f9f9;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 30px;
            border-left: 4px solid #4CAF50;
          }
          .form-section h2 {
            color: #4CAF50;
            font-size: 18px;
            margin-bottom: 15px;
          }
          .form-group {
            margin-bottom: 15px;
          }
          label {
            display: block;
            margin-bottom: 5px;
            color: #333;
            font-weight: 500;
          }
          input[type="text"],
          input[type="number"] {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
            font-family: inherit;
          }
          input[type="text"]:focus,
          input[type="number"]:focus {
            outline: none;
            border-color: #4CAF50;
            box-shadow: 0 0 5px rgba(76, 175, 80, 0.3);
          }
          .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }
          .button-group {
            display: flex;
            gap: 10px;
            justify-content: center;
          }
          button {
            padding: 12px 30px;
            border: none;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          .btn-add {
            background-color: #4CAF50;
            color: white;
          }
          .btn-add:hover {
            background-color: #45a049;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(76, 175, 80, 0.3);
          }
          .btn-clear {
            background-color: #999;
            color: white;
          }
          .btn-clear:hover {
            background-color: #777;
          }
          .btn-delete {
            background-color: #f44336;
            color: white;
            padding: 8px 16px;
            font-size: 13px;
          }
          .btn-delete:hover {
            background-color: #da190b;
          }
          .btn-edit {
            background-color: #2196F3;
            color: white;
            padding: 8px 16px;
            font-size: 13px;
          }
          .btn-edit:hover {
            background-color: #0b7dda;
          }
          .table-section {
            margin-top: 30px;
          }
          .table-section h2 {
            color: #333;
            font-size: 18px;
            margin-bottom: 15px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            background: white;
          }
          th {
            background-color: #4CAF50;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
          }
          td {
            padding: 12px;
            border-bottom: 1px solid #ddd;
          }
          tr:hover {
            background-color: #f5f5f5;
          }
          .action-buttons {
            display: flex;
            gap: 8px;
          }
          .empty-message {
            text-align: center;
            color: #999;
            padding: 30px;
            font-style: italic;
          }
          .success-message {
            background-color: #d4edda;
            color: #155724;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
            border-left: 4px solid #28a745;
            display: none;
          }
          .success-message.show {
            display: block;
          }
          @media (max-width: 600px) {
            .form-row {
              grid-template-columns: 1fr;
            }
            .container {
              padding: 15px;
            }
            table {
              font-size: 13px;
            }
            button {
              padding: 10px 15px;
              font-size: 13px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>📚 ระบบจัดการฐานข้อมูลนักศึกษา</h1>
          <p class="subtitle">เพิ่ม แก้ไข และลบข้อมูลนักศึกษา</p>

          <div id="successMessage" class="success-message"></div>

          <div class="form-section">
            <h2>➕ เพิ่มรายชื่อนักศึกษา</h2>
            <form id="addStudentForm" onsubmit="addStudent(event)">
              <div class="form-row">
                <div class="form-group">
                  <label for="studentId">รหัสนักศึกษา</label>
                  <input type="number" id="studentId" name="studentId" required placeholder="เช่น 12345789">
                </div>
                <div class="form-group">
                  <label for="studentName">ชื่อนักศึกษา</label>
                  <input type="text" id="studentName" name="studentName" required placeholder="เช่น นายรพีพัทธ์ เจริญรัฐวุฒิกุล">
                </div>
              </div>
              <div class="button-group">
                <button type="submit" class="btn-add">บันทึกข้อมูล</button>
                <button type="reset" class="btn-clear">ล้างฟอร์ม</button>
              </div>
            </form>
          </div>

          <div class="table-section">
            <h2>📋 รายชื่อนักศึกษา</h2>
            <table id="studentsTable">
              <thead>
                <tr>
                  <th>รหัสนักศึกษา</th>
                  <th>ชื่อนักศึกษา</th>
                  <th>การจัดการ</th>
                </tr>
              </thead>
              <tbody>
    `;

    if (result.rows.length === 0) {
      html += `<tr><td colspan="3" class="empty-message">ยังไม่มีข้อมูลนักศึกษา</td></tr>`;
    } else {
      result.rows.forEach(row => {
        html += `
          <tr>
            <td>${row.student_id}</td>
            <td>${row.student_name}</td>
            <td>
              <div class="action-buttons">
                <button class="btn-edit" onclick="editStudent(${row.student_id}, '${row.student_name.replace(/'/g, "\\'")}')">แก้ไข</button>
                <button class="btn-delete" onclick="deleteStudent(${row.student_id})">ลบ</button>
              </div>
            </td>
          </tr>
        `;
      });
    }

    html += `
              </tbody>
            </table>
          </div>
        </div>

        <script>
          // ตัวแปรเก็บ ID ของรายการที่กำลังแก้ไข
          let editingId = null;

          // ฟังก์ชันสำหรับเพิ่มหรืออัปเดตข้อมูล
          async function addStudent(event) {
            event.preventDefault();
            
            const studentId = document.getElementById('studentId').value;
            const studentName = document.getElementById('studentName').value;
            
            try {
              const endpoint = editingId ? '/api/students/' + editingId : '/api/students';
              const method = editingId ? 'PUT' : 'POST';
              
              const response = await fetch(endpoint, {
                method: method,
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  student_id: parseInt(studentId),
                  student_name: studentName
                })
              });

              if (response.ok) {
                const message = editingId ? 'อัปเดตข้อมูลสำเร็จ!' : 'เพิ่มข้อมูลสำเร็จ!';
                showSuccessMessage(message);
                document.getElementById('addStudentForm').reset();
                editingId = null;
                document.getElementById('studentId').disabled = false;
                document.querySelector('.form-section h2').textContent = '➕ เพิ่มรายชื่อนักศึกษา';
                document.querySelector('.btn-add').textContent = 'บันทึกข้อมูล';
                setTimeout(() => location.reload(), 1500);
              } else {
                const error = await response.json();
                alert('เกิดข้อผิดพลาด: ' + error.message);
              }
            } catch (error) {
              alert('เกิดข้อผิดพลาด: ' + error.message);
            }
          }

          // ฟังก์ชันเพื่อแสดงข้อมูลเพื่อแก้ไข
          function editStudent(id, name) {
            document.getElementById('studentId').value = id;
            document.getElementById('studentName').value = name;
            editingId = id;
            document.querySelector('.form-section h2').textContent = '✏️ แก้ไขข้อมูลนักศึกษา';
            document.querySelector('.btn-add').textContent = 'อัปเดตข้อมูล';
            document.getElementById('studentId').disabled = true;
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }

          // ฟังก์ชันสำหรับลบข้อมูล
          async function deleteStudent(id) {
            if (confirm('คุณแน่ใจที่จะลบข้อมูลนี้หรือ?')) {
              try {
                const response = await fetch('/api/students/' + id, {
                  method: 'DELETE'
                });

                if (response.ok) {
                  showSuccessMessage('ลบข้อมูลสำเร็จ!');
                  setTimeout(() => location.reload(), 1500);
                } else {
                  const error = await response.json();
                  alert('เกิดข้อผิดพลาด: ' + error.message);
                }
              } catch (error) {
                alert('เกิดข้อผิดพลาด: ' + error.message);
              }
            }
          }

          // ฟังก์ชันแสดงข้อความสำเร็จ
          function showSuccessMessage(message) {
            const messageDiv = document.getElementById('successMessage');
            messageDiv.textContent = message;
            messageDiv.classList.add('show');
            setTimeout(() => {
              messageDiv.classList.remove('show');
            }, 3000);
          }
        </script>
      </body>
      </html>
    `;

    return html;
  } catch (err) {
    console.error(err);
    return `
      <h1>เกิดข้อผิดพลาด!</h1>
      <p>${err.message}</p>
    `;
  }
}

// ฟังก์ชันสำหรับจัดการ API requests
async function handleApiRequest(req, res, parsedUrl) {
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // GET - ดึงข้อมูลนักศึกษาทั้งหมด
  if (pathname === '/api/students' && method === 'GET') {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM students ORDER BY student_id');
      client.release();
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(result.rows));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ message: err.message }));
    }
  }
  // POST - เพิ่มนักศึกษาใหม่
  else if (pathname === '/api/students' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const client = await pool.connect();
        
        // ตรวจสอบว่า ID มีอยู่แล้ว
        const checkResult = await client.query(
          'SELECT * FROM students WHERE student_id = $1',
          [data.student_id]
        );
        
        if (checkResult.rows.length > 0) {
          client.release();
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ message: 'รหัสนักศึกษานี้มีอยู่แล้ว' }));
          return;
        }

        const result = await client.query(
          'INSERT INTO students (student_id, student_name) VALUES ($1, $2) RETURNING *',
          [data.student_id, data.student_name]
        );
        client.release();
        res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(result.rows[0]));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ message: err.message }));
      }
    });
  }
  // PUT - อัปเดตข้อมูลนักศึกษา
  else if (pathname.match(/^\/api\/students\/\d+$/) && method === 'PUT') {
    const id = parseInt(pathname.split('/')[3]);
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const client = await pool.connect();
        const result = await client.query(
          'UPDATE students SET student_name = $1 WHERE student_id = $2 RETURNING *',
          [data.student_name, id]
        );
        client.release();
        
        if (result.rows.length === 0) {
          res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ message: 'ไม่พบรายชื่อนักศึกษา' }));
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify(result.rows[0]));
        }
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ message: err.message }));
      }
    });
  }
  // DELETE - ลบข้อมูลนักศึกษา
  else if (pathname.match(/^\/api\/students\/\d+$/) && method === 'DELETE') {
    const id = parseInt(pathname.split('/')[3]);
    try {
      const client = await pool.connect();
      const result = await client.query(
        'DELETE FROM students WHERE student_id = $1 RETURNING *',
        [id]
      );
      client.release();
      
      if (result.rows.length === 0) {
        res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ message: 'ไม่พบรายชื่อนักศึกษา' }));
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(result.rows[0]));
      }
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ message: err.message }));
    }
  }
  // 404 - ไม่พบ endpoint
  else {
    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ message: 'ไม่พบ endpoint นี้' }));
  }
}

// สร้าง HTTP Server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // ตั้งค่า CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // จัดการ OPTIONS request
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // จัดการ API requests
  if (pathname.startsWith('/api/')) {
    handleApiRequest(req, res, parsedUrl);
  }
  // หน้าแรก
  else if (pathname === '/' || pathname === '') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    const html = await getMainHTML();
    res.end(html);
  }
  // 404
  else {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>404 - ไม่พบหน้านี้</h1>');
  }
});

server.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

