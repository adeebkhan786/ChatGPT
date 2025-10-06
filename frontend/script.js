const input = document.querySelector('#input');
const chatContrainer = document.querySelector('#chat-container');
const askBtn = document.querySelector('#ask');


input.addEventListener('keyup', handleEnter);
askBtn.addEventListener('click', handleAsk);
const loading = document.createElement('div');
loading.className = "my-6 animate-pulse";
loading.textContent = "Thinking...";

async function generate(text) {
    /*
    1. Append message to ui
    2. send it to LLM
    3. Append response to ui
    */

    const msg = document.createElement('div');
    msg.className = "my-6 bg-neutral-800 p-3 rounded-xl ml-auto max-w-fit";
    msg.textContent = text;
    chatContrainer?.appendChild(msg);
    input.value = '';

    chatContrainer?.appendChild(loading);

    //call server
    const assistentMessage = await callServer(text);
    const asssistentMsgElem = document.createElement('div');
    asssistentMsgElem.className = "mx-w-fit";
    asssistentMsgElem.textContent = assistentMessage;
    loading.remove();
    chatContrainer?.appendChild(asssistentMsgElem); 
}


async function callServer(inputText) {
    const response = await fetch('http://localhost:3001/chat', {
        method: 'POST',
        headers: {  'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputText })
    });

    if(!response.ok){
        throw new Error('Error generating the response.');
    }

    const result = await response.json();
    return result.message;
}


async function handleEnter(e) {
    if (e.key === 'Enter') {
        const text = input?.value.trim();
        if (!text) {
            return;
        }

        await generate(text);
    }
};


async function handleAsk(e) {
    const text = input?.value.trim();
    if (!text) {
        return;
    };

    await generate(text);
}