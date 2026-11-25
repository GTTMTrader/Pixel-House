# Pixel House 모바일 웹판 (개인용)

원본: https://github.com/dangnuie-web/pixel-house v0.2.2 (Dangnee, 코드 MIT / 그림·캐릭터·대사는 원작자 권리 — LICENSE 참고)

- 데스크톱 앱(Electron)의 저장 코드를 브라우저 안에서 그대로 돌리고, 기록 파일은 폰 브라우저 저장소에 둡니다.
- 바뀐 것: 아래 탭 막대, 폰 화면 맞춤, "Esc 닫기" → 눌러서 닫기, 기록 백업(설정 > 탭·백업), 홈 화면 앱(PWA)·오프라인.
- 빠진 것: 바탕화면 펫(데스크톱 전용).
- 기록은 이 폰 브라우저 안에만 있으니, 설정 > 탭·백업 > 전체 백업 내보내기로 가끔 저장해 두세요.

새로 추가한 파일: web/ (backend.js, patch.js, mobile.css, icons/), manifest.webmanifest, sw.js. index.html 은 web/ 파일을 읽는 줄만 추가.
