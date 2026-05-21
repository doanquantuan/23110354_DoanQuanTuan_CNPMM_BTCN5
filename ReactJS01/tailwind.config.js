/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Thay thế dải màu primary tím bằng tông Nâu Be/Sand
        primary: {
          50: '#FDFBF7',  // Rất nhạt
          100: '#F5F0E8', // Nền be nhạt
          200: '#E8DFD1', // Be đậm hơn
          300: '#D5C3AA', // Nâu cát nhẹ
          400: '#C1A689', // Nâu be chuẩn
          500: '#A88865', // Màu nâu chủ đạo
          600: '#8E7051', // Nâu đậm nhấn
          700: '#755B3E',
          800: '#5C462C',
          900: '#45331E', // Nâu rất đậm cho tiêu đề
        },
      },
      // Nếu bạn muốn dùng tên 'bakery-primary' như trong code cũ:
      // Bạn có thể thêm vào đây hoặc dùng 'primary' thay thế
    },
  },
  plugins: [],
}