const fs = require('fs');
const filePath = "c:\\d\\bluuu\\bluuu\\src\\home1.jsx";
let text = fs.readFileSync(filePath, 'utf8');

const replacements = {
    "max-w-\\[1400px\\]": "max-w-7xl",
    "max-w-\\[1240px\\]": "max-w-6xl",
    "max-w-\\[1200px\\]": "max-w-6xl",
    "max-w-\\[900px\\]": "max-w-4xl",
    "min-h-\\[100dvh\\]": "min-h-screen",
    "h-\\[100dvh\\]": "min-h-screen",
    "min-h-\\[750px\\]": "",
    "min-h-\\[460px\\]": "min-h-96",
    "min-w-\\[750px\\]": "min-w-fit",
    "h-\\[240px\\]": "h-64",
    "h-\\[500px\\]": "min-h-96",
    
    "text-\\[10px\\]": "text-xs",
    "text-\\[11px\\]": "text-xs",
    "text-\\[12px\\]": "text-xs",
    "text-\\[13px\\]": "text-sm",
    "text-\\[14px\\]": "text-sm",
    "text-\\[15px\\]": "text-sm",
    "text-\\[16px\\]": "text-base",
    "text-\\[17px\\]": "text-base",
    "text-\\[18px\\]": "text-lg",
    "text-\\[19px\\]": "text-xl",
    "text-\\[20px\\]": "text-xl",
    "text-\\[22px\\]": "text-xl",
    "text-\\[24px\\]": "text-2xl",
    "text-\\[26px\\]": "text-3xl",
    "text-\\[28px\\]": "text-3xl",
    "text-\\[32px\\]": "text-4xl",
    "text-\\[34px\\]": "text-4xl",
    "text-\\[36px\\]": "text-4xl",
    "text-\\[40px\\]": "text-5xl",
    "text-\\[48px\\]": "text-5xl",
    "text-\\[56px\\]": "text-6xl",
    "text-\\[100px\\]": "text-8xl",
    
    "leading-\\[1\\.05\\]": "leading-none",
    "leading-\\[1\\.4\\]": "leading-snug",
    "leading-\\[1\\.6\\]": "leading-relaxed",
    "tracking-\\[0\\.2em\\]": "tracking-widest",
    "tracking-\\[0\\.3em\\]": "tracking-widest",
    "tracking-\\[0\\.15em\\]": "tracking-wider",
    "tracking-\\[0\\.05em\\]": "tracking-wide",
    
    "w-\\[1px\\]": "w-px",
    "w-\\[14px\\]": "w-3.5",
    "w-\\[18px\\]": "w-5",
    "w-\\[20px\\]": "w-5",
    "h-\\[14px\\]": "h-3.5",
    "h-\\[18px\\]": "h-5",
    "h-\\[20px\\]": "h-5",
    "w-\\[25%\\]": "w-1/4",
    "w-\\[85%\\]": "w-10/12",
    
    "-my-\\[50px\\]": "-my-12",
    "py-\\[50px\\]": "py-12",
    "pt-\\[120px\\]": "pt-32",
    "py-\\[18px\\]": "py-4",
    "gap-\\[4px\\]": "gap-1",
    
    "flex-\\[0_0_85%\\]": "flex-none w-10/12",
    "aspect-\\[4/3\\]": "aspect-video",
    
    "scale-\\[1\\.02\\]": "scale-100",
    "scale-\\[1\\.03\\]": "scale-105",
    "scale-\\[1\\.04\\]": "scale-105",
    "scale-\\[1\\.05\\]": "scale-105",
    "brightness-\\[0\\.7\\]": "brightness-75",
    
    "bg-\\[#FF6B4A\\]": "bg-orange-500",
    "bg-\\[#FDF8F4\\]": "bg-orange-50",
    "bg-\\[#F0C966\\]": "bg-yellow-400",
    "border-\\[#F0E6DD\\]": "border-orange-200",
    "text-\\[#FF6B4A\\]": "text-orange-500",
    "fill-\\[#FF6B4A\\]": "fill-orange-500",
    "border-\\[3px\\]": "border-4",
    "border-\\[2px\\]": "border-2",
    
    "bg-white/\\[0\\.0[1-3]\\]": "bg-white/5",
    "bg-white/\\[0\\.0[4-9]\\]": "bg-white/10",
    "bg-white/\\[0\\.10\\]": "bg-white/10",
    
    "shadow-\\[0_20px_60px_rgba\\(0,37,66,0\\.08\\)\\]": "shadow-xl",
    "shadow-\\[0_25px_70px_rgba\\(0,37,66,0\\.12\\)\\]": "shadow-2xl",
    "shadow-\\[0_8px_30px_rgba\\(0,115,224,0\\.3\\)\\]": "shadow-xl shadow-primary-500/30",
    "shadow-\\[0_0_50px_rgba\\(0,115,224,0\\.15\\)\\]": "shadow-2xl shadow-primary-500/20",
    "shadow-\\[0_20px_40px_rgba\\(0,37,66,0\\.1\\)\\]": "shadow-xl",
};

for (const [key, value] of Object.entries(replacements)) {
    const regex = new RegExp(key, 'g');
    text = text.replace(regex, value);
}

text = text.replace(/h-\[560px\]/g, "min-h-96");

fs.writeFileSync(filePath, text, 'utf8');
console.log("Refactor complete.");
