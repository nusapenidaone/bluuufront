import sys
import re

file_path = r"c:\d\bluuu\bluuu\src\home1.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

replacements = {
    r"max-w-\[1400px\]": "max-w-7xl",
    r"max-w-\[1240px\]": "max-w-6xl",
    r"max-w-\[1200px\]": "max-w-6xl",
    r"max-w-\[900px\]": "max-w-4xl",
    r"min-h-\[100dvh\]": "min-h-screen",
    r"h-\[100dvh\]": "min-h-screen",
    r"min-h-\[750px\]": "",
    r"min-h-\[460px\]": "min-h-96",
    r"min-w-\[750px\]": "min-w-fit",
    r"h-\[240px\]": "h-64",
    r"h-\[500px\]": "min-h-96",
    r"h-\[560px\]": "min-h-[36rem]", # wait, bracket! let's use h-svh or something maybe just leave h-auto
    
    r"text-\[10px\]": "text-xs",
    r"text-\[11px\]": "text-xs",
    r"text-\[12px\]": "text-xs",
    r"text-\[13px\]": "text-sm",
    r"text-\[14px\]": "text-sm",
    r"text-\[15px\]": "text-sm",
    r"text-\[16px\]": "text-base",
    r"text-\[17px\]": "text-base",
    r"text-\[18px\]": "text-lg",
    r"text-\[19px\]": "text-xl",
    r"text-\[20px\]": "text-xl",
    r"text-\[22px\]": "text-xl",
    r"text-\[24px\]": "text-2xl",
    r"text-\[26px\]": "text-3xl",
    r"text-\[28px\]": "text-3xl",
    r"text-\[32px\]": "text-4xl",
    r"text-\[34px\]": "text-4xl",
    r"text-\[36px\]": "text-4xl",
    r"text-\[40px\]": "text-5xl",
    r"text-\[48px\]": "text-5xl",
    r"text-\[56px\]": "text-6xl",
    r"text-\[100px\]": "text-8xl",
    
    r"leading-\[1\.05\]": "leading-none",
    r"leading-\[1\.4\]": "leading-snug",
    r"leading-\[1\.6\]": "leading-relaxed",
    r"tracking-\[0\.2em\]": "tracking-widest",
    r"tracking-\[0\.3em\]": "tracking-widest",
    r"tracking-\[0\.15em\]": "tracking-wider",
    r"tracking-\[0\.05em\]": "tracking-wide",
    
    r"w-\[1px\]": "w-px",
    r"w-\[14px\]": "w-3.5",
    r"w-\[18px\]": "w-5",
    r"w-\[20px\]": "w-5",
    r"h-\[14px\]": "h-3.5",
    r"h-\[18px\]": "h-5",
    r"h-\[20px\]": "h-5",
    r"w-\[25%\]": "w-1/4",
    r"w-\[85%\]": "w-10/12",
    
    r"-my-\[50px\]": "-my-12",
    r"py-\[50px\]": "py-12",
    r"pt-\[120px\]": "pt-32",
    r"py-\[18px\]": "py-4",
    r"gap-\[4px\]": "gap-1",
    
    r"flex-\[0_0_85%\]": "flex-none w-10/12",
    r"aspect-\[4/3\]": "aspect-video",
    
    r"scale-\[1\.02\]": "scale-100",
    r"scale-\[1\.03\]": "scale-105",
    r"scale-\[1\.04\]": "scale-105",
    r"scale-\[1\.05\]": "scale-105",
    r"brightness-\[0\.7\]": "brightness-75",
    
    r"bg-\[#FF6B4A\]": "bg-orange-500",
    r"bg-\[#FDF8F4\]": "bg-orange-50",
    r"bg-\[#F0C966\]": "bg-yellow-400",
    r"border-\[#F0E6DD\]": "border-orange-200",
    r"text-\[#FF6B4A\]": "text-orange-500",
    r"fill-\[#FF6B4A\]": "fill-orange-500",
    r"border-\[3px\]": "border-4",
    
    r"bg-white/\[0\.0[1-3]\]": "bg-white/5",
    r"bg-white/\[0\.0[4-9]\]": "bg-white/10",
    r"bg-white/\[0\.10\]": "bg-white/10",
    
    r"shadow-\[0_20px_60px_rgba\(0,37,66,0\.08\)\]": "shadow-xl",
    r"shadow-\[0_25px_70px_rgba\(0,37,66,0\.12\)\]": "shadow-2xl",
    r"shadow-\[0_8px_30px_rgba\(0,115,224,0\.3\)\]": "shadow-xl shadow-primary-500/30",
    r"shadow-\[0_0_50px_rgba\(0,115,224,0\.15\)\]": "shadow-2xl shadow-primary-500/20",
    r"shadow-\[0_20px_40px_rgba\(0,37,66,0\.1\)\]": "shadow-xl",
}

for k, v in replacements.items():
    text = re.sub(k, v, text)
    
text = text.replace("h-[560px]", "h-[560px]") # I'll just change to h-[40rem] if requested but let's test this
text = re.sub(r'h-\[500px\]', "min-h-96", text)
text = re.sub(r'h-\[560px\]', "min-h-96", text)
text = re.sub(r'h-\[240px\]', "h-64", text)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(text)

print("Refactor complete! Please check.")
