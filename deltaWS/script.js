function DWSTDtoHTML(file) {
    const lines = file.split('\n');
    let html = '';
    const vars = [];
    lines.forEach((elem, idx) => {
        const [instuction, ...variables] = elem.split(' ');
        switch (instuction) {
            case 'STYLE_PROPERTY': {
                const [property, value] = variables;
                vars[idx] = `${property}:${value.replace(/-/g, ' ')}`;
                break;
            }
            case 'STYLE': {
                vars[idx] = variables.map(e => vars[e]).join(';');
                break;
            }
            case 'TEXT': {
                const [text, style] = variables;
                html += `<p style="${vars[style]}">${text.replace(/\\s/g, '&nbsp;').replace(/\\t/g, '&nbsp;'.repeat(8)).replace(/\\n/g, '<br>')}</p>`;
                break;
            }
            case 'IMAGE': {
                const [src, style] = variables;
                html += `<img src="${src}" style="${vars[style]}">`;
                break;
            }
            case "": {
                break;
            }
            default:
                html += '<span style="color:red">Error: Invalid instruction on DWSTD file.</span>';
        }
    });
    const total = html;
    html = "";
    return total;
}

function DWSFDtoHTML(file) {
    const lines = file.split('\n');
    let html = '';
    const vars = [];
    lines.forEach((elem, idx) => {
        const [instuction, ...variables] = elem.split(' ');
        switch (instuction) {
            case 'TITLE': {
                const [title] = variables;
                html += `<h1>${title.replace(/\\s/g, '&nbsp;').replace(/\\t/g, '&nbsp;'.repeat(8)).replace(/\\n/g, '<br>')}</h1>`;
                break;
            }
            case 'SELECT': {
                const [question, ...options] = variables;
                html += `<p class="q">${question.replace(/\\s/g, '&nbsp;').replace(/\\t/g, '&nbsp;'.repeat(8)).replace(/\\n/g, '<br>')}</p><select class="r">${options.map(e => `<option value="${e}">${e}</option>`).join('')}</select>`;
                break;
            }
            case 'TEXT_AREA': {
                const [question] = variables;
                html += `<p class="q">${question.replace(/\\s/g, '&nbsp;').replace(/\\t/g, '&nbsp;'.repeat(8)).replace(/\\n/g, '<br>')}</p><textarea class="r"></textarea>`;
                break;
            }
            case 'CHECK_BOX': {
                const [question] = variables;
                html += `<p class="q">${question.replace(/\\s/g, '&nbsp;').replace(/\\t/g, '&nbsp;'.repeat(8)).replace(/\\n/g, '<br>')}</p><input type="checkbox" class="r" />`;
                break;
            }
            case 'NUMBER': {
                const [question, min, max, step] = variables;
                html += `<p class="q">${question.replace(/\\s/g, '&nbsp;').replace(/\\t/g, '&nbsp;'.repeat(8)).replace(/\\n/g, '<br>')}</p><input type="number" class="r" min="${min}" max="${max}" step="${step}" />`;
                break;
            }
            case 'SHORT_ANSWER': {
                const [question, nick] = variables;
                html += `<label for="${nick}" class="q">${question.replace(/\\s/g, '&nbsp;').replace(/\\t/g, '&nbsp;'.repeat(8)).replace(/\\n/g, '<br>')}</label><br><input type="text" class="r" id="${nick}" />`;
                break;
            }
            case "": {
                break;
            }
            default:
                html += '<span style="color:red">Error: Invalid instruction on DWSF file.</span>';
        }
    });
    const total = html + `<br><button onclick="getDWSFDAnswers()">Download answers</button>`;
    html = "";
    return total;
}

function getDWSFDAnswers() {
    const questions = Array.from(out.querySelectorAll('.q')).map(e => e.textContent);
    const answers = Array.from(out.querySelectorAll('.r')).map(e => {
        switch (e.tagName.toLowerCase()) {
            case 'select':
                return e.value;
            case 'input':
                switch (e.type) {
                    case 'checkbox':
                        return e.checked;
                    case 'number':
                        return Number(e.value);
                    case 'text':
                        return e.value;
                    default:
                        return e.value;
                }
            case 'textarea':
                return e.value;
            default:
                return e.value;
        }
    });

    const org = {};
    questions.forEach((elem, idx) => org[elem] = answers[idx]);
    const blob = new Blob([JSON.stringify(org)], { type: 'text/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `responses.json`;
    a.click();
    URL.revokeObjectURL(a.href);
}

function upLoadFile(accept) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.click();
    let data;
    const loaded = new Promise((resolve) => {
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                data = event.target.result;
                resolve(data);
            };
            reader.readAsText(file);
        };
    });
    return loaded;
}

let lang = 'dwstd';

upltd.onclick = async () => {
    out.textContent = 'Parsing...';
    const file = await upLoadFile('.dwstd');
    out.innerHTML = DWSTDtoHTML(file);
    ind.value = file;
    ind.classList.add('collapsed');
    lang = 'dwstd';
}

uplfd.onclick = async () => {
    out.textContent = 'Parsing...';
    const file = await upLoadFile('.dwsfd');
    out.innerHTML = DWSFDtoHTML(file);
    ind.value = file;
    ind.classList.add('collapsed');
    lang = 'dwsfd';
}

addtd.onclick = async () => {
    ind.classList.remove('collapsed');
    ind.value = '';
    lang = 'dwstd';
}

addfd.onclick = async () => {
    ind.classList.remove('collapsed');
    ind.value = '';
    lang = 'dwsfd';
}

down.onclick = () => {
    const blob = new Blob([ind.value], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `document.${lang}`;
    a.click();
    URL.revokeObjectURL(a.href);
}

function change() {
    switch (lang) {
        case 'dwstd':
            out.innerHTML = DWSTDtoHTML(ind.value);
            break;
        case 'dwsfd':
            out.innerHTML = DWSFDtoHTML(ind.value);
            break;
        default:
            out.innerHTML = '<span style="color:red">Error: Invalid language.</span>';
    }
}
