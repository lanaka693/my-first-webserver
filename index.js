// 1. นําเข้า Express.js (เป็น Framework เครื่องมือทุ่นแรงที่ช่วยให้เราสร้าง Web Server ได้ง่ายและสั้นลง)
const express = require("express");
const app = express();
// 2. สร้างเส้นทาง (Route) สําหรับหน้าแรก
// เมื่อมีผู้ใช้พิมพ์ URL เข้ามาที่หน้าแรก ("/") Server จะรับคําร้องขอ (request) และตอบกลับ(response)
app.get("/", (request, response) => {
// 3. สิ่งที่ Server จะส่งกลับไปแสดงผลบนหน้าจอผู้ใช้ (ใช้ภาษา HTML ในการจัดรูปแบบ)
response.send(`
<div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
<h1>ยินดีต้อนรับสู่ Server ของผม/หนู</h1>
<p>นี่คือ Web Server เครื่องแรกที่สร้างขึ้นเองด้วย Node.js ครับ/ค่ะ</p>
<hr>
<h2>ข้อมูลนักศึกษา</h2>
<p><strong>รหัสนักศึกษา:</strong> [69319010072]</p>
<p><strong>ชื่อ-นามสกุล:</strong> [ดวงธิดา แสนอุบล]</p>
</div>
`);
});
// 4. สั่งให้ Server เริ่มทํางาน (Listen) และเปิดประตูรอรับแขก
// ข้อควรระวัง: บน Render เราต้องใช้พอร์ตที่ระบบกําหนดให้ (process.env.PORT) หรือถ้าไม่มีให้ใช้
3000
const port = process.env.PORT || 3000;
app.listen(port, () => {
console.log(" Web Server สตาร์ทสําเร็จแล้ว! กําลังทํางานที่พอร์ต: " + port);
});
