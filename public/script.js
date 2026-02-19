// HTML 요소들 가져오기
const imageInput = document.getElementById('imageInput');
const canvas = document.getElementById('processCanvas');
const ctx = canvas.getContext('2d');
const asciiOutput = document.getElementById('asciiOutput');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');

// ASCII 문자 맵핑 (어두운 색 -> 밝은 색 순서)
// 어두운 부분은 빈 공간(' ')으로, 밝은 부분은 빽빽한 문자('@')로 표현합니다.
const ASCII_CHARS = " .:-=+*#%@"; 

imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. 파일을 읽어서 이미지 객체로 만듭니다.
    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            // 2. 아스키 아트의 가로 픽셀(글자) 수 설정
            const width = 100; // 가로로 100글자
            
            // [핵심 팁] 글자는 보통 가로보다 세로가 깁니다.
            // 비율이 찌그러지지 않게 높이에 0.5 정도를 곱해 보정해줍니다.
            const height = Math.floor((img.height / img.width) * width * 0.5);

            // 3. 숨겨진 캔버스에 리사이징된 이미지를 그립니다.
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            // 4. 그려진 이미지의 픽셀 데이터를 뽑아옵니다.
            const imageData = ctx.getImageData(0, 0, width, height);
            const pixels = imageData.data;
            let asciiStr = "";

            // 5. 픽셀 하나하나의 밝기를 계산해 문자로 바꿉니다.
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    // 하나의 픽셀은 R, G, B, Alpha 4개의 값을 가집니다.
                    const offset = (y * width + x) * 4;
                    const r = pixels[offset];
                    const g = pixels[offset + 1];
                    const b = pixels[offset + 2];
                    
                    // RGB를 이용해 흑백(밝기) 수치 계산 (0~255)
                    const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
                    
                    // 밝기를 ASCII_CHARS 배열의 인덱스로 변환
                    const charIndex = Math.floor((brightness / 255) * (ASCII_CHARS.length - 1));
                    asciiStr += ASCII_CHARS[charIndex];
                }
                asciiStr += "\n"; // 한 줄이 끝나면 줄바꿈
            }

            // 6. 완성된 문자열을 화면에 출력!
            asciiOutput.textContent = asciiStr;
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file); // 파일 읽기 시작
});

// [기능 A] 클립보드 복사 로직
copyBtn.addEventListener('click', () => {
    const textToCopy = asciiOutput.textContent;
    if (textToCopy === "여기에 결과가 나타납니다...") {
        alert("먼저 이미지를 변환해주세요!");
        return;
    }
    navigator.clipboard.writeText(textToCopy)
        .then(() => alert("클립보드에 복사되었습니다! 카톡에 붙여넣기 해보세요."))
        .catch(err => alert("복사 실패: " + err));
});

// [기능 B] 텍스트 파일(.txt) 다운로드 로직
downloadBtn.addEventListener('click', () => {
    const textToSave = asciiOutput.textContent;
    if (textToSave === "여기에 결과가 나타납니다...") {
        alert("먼저 이미지를 변환해주세요!");
        return;
    }
    // 텍스트를 Blob 객체(파일 형태)로 뭉칩니다.
    const blob = new Blob([textToSave], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    
    // a 태그를 몰래 만들어서 강제로 클릭시킵니다.
    const a = document.createElement('a');
    a.href = url;
    a.download = "설날음식_아스키아트.txt"; // 저장될 파일 이름
    a.click();
    
    // 다 쓴 URL은 메모리에서 지워줍니다.
    URL.revokeObjectURL(url);
});