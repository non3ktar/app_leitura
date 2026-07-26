const fs = require('fs');
let js = fs.readFileSync('app.js', 'utf8');

const regex = /if\(btnStartAura\) \{[\s\S]*?btnStartAura\.addEventListener\('click', \(\) => \{[\s\S]*?switchView\('aura'\);\n        \}\);\n    \}/;

const auraLogic = `
    if(btnStartAura) {
        btnStartAura.addEventListener('click', () => {
            currentStudent = inputStudentName.value.trim();
            currentBook = selectBook.options[selectBook.selectedIndex].text;
            
            playerData.name = currentStudent;
            playerData.aura = 0;
            playerData.history = [0];
            currentQuestion = 1;

            initAuraUI();
            switchView('aura');
        });
    }
`;

js = js.replace(regex, auraLogic);
fs.writeFileSync('app.js', js, 'utf8');
console.log("Fixed btnStartAura block");
