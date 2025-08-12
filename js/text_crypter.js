import { app } from "../../scripts/app.js";

app.registerExtension({
    name: "xor_pickle_nodes.text_crypter",
    async setup() {
        const modalStyles = `
            /* ... stili CSS precedenti ... */
            .text-crypter-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            .text-crypter-modal {
                background-color: #222;
                border: 1px solid #444;
                border-radius: 8px;
                padding: 25px;
                width: 450px;
                max-width: 90%;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
                font-family: Arial, sans-serif;
                color: #ddd;
                position: relative;
            }
            .text-crypter-modal h2 {
                margin-top: 0;
                color: #fff;
                font-size: 1.5em;
                text-align: center;
            }
            .text-crypter-modal label {
                display: block;
                margin-top: 15px;
                margin-bottom: 5px;
                font-size: 0.9em;
                color: #bbb;
            }
            .text-crypter-modal textarea, .text-crypter-modal input {
                width: 100%;
                box-sizing: border-box;
                background-color: #333;
                border: 1px solid #555;
                color: #fff;
                padding: 10px;
                border-radius: 4px;
                font-size: 1em;
            }
            .text-crypter-modal textarea {
                resize: vertical;
                min-height: 100px;
            }
            .text-crypter-modal input[type="password"] {
                font-family: monospace;
            }
            .text-crypter-modal .button-group {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                margin-top: 20px;
            }
            .text-crypter-modal button {
                padding: 10px 20px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
                transition: background-color 0.2s;
            }
            .text-crypter-modal .crypt-button {
                background-color: #007bff;
                color: white;
            }
            .text-crypter-modal .crypt-button:hover {
                background-color: #0056b3;
            }
            .text-crypter-modal .close-button {
                background-color: #555;
                color: white;
            }
            .text-crypter-modal .close-button:hover {
                background-color: #777;
            }
            .text-crypter-modal .close-icon {
                position: absolute;
                top: 10px;
                right: 15px;
                font-size: 20px;
                cursor: pointer;
                color: #aaa;
            }
            .text-crypter-modal .close-icon:hover {
                color: #fff;
            }
            .text-crypter-result {
                background-color: #1a1a1a;
                border: 1px solid #444;
                padding: 10px;
                border-radius: 4px;
                margin-top: 15px;
                min-height: 50px;
                word-wrap: break-word;
                font-family: monospace;
                font-size: 0.9em;
                white-space: pre-wrap;
                position: relative;
            }
            .text-crypter-result .copy-button {
                position: absolute;
                top: 5px;
                right: 5px;
                background: #444;
                color: white;
                border: none;
                padding: 5px 10px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                opacity: 0.7;
                transition: opacity 0.2s;
            }
            .text-crypter-result:hover .copy-button {
                opacity: 1;
            }
        `;

        if (!document.getElementById('text-crypter-styles')) {
            const styleSheet = document.createElement("style");
            styleSheet.id = 'text-crypter-styles';
            styleSheet.innerText = modalStyles;
            document.head.appendChild(styleSheet);
        }

        const btn = document.createElement("button");
        btn.textContent = 'Text Crypter';
        btn.className = 'text-crypter-button comfyui-button comfyui-menu-mobile-collapse primary';
        
        const icon = document.createElement("i");
        icon.className = "fa-solid fa-lock";
        btn.prepend(icon);

        const iconStyle = document.createElement("style");
        iconStyle.innerHTML = `
            .text-crypter-button i {
                margin-right: 8px;
            }
        `;
        document.head.appendChild(iconStyle);
        
        // Memorizza i dati tra le sessioni del modal
        let savedData = {
            text: '',
            password: '',
            result: ''
        };

        const showModal = () => {
            const modalHTML = `
                <div class="text-crypter-modal-overlay" id="crypter-modal-overlay">
                    <div class="text-crypter-modal">
                        <span class="close-icon" id="close-modal">&times;</span>
                        <h2>Text Crypter</h2>
                        <label for="text-input">Testo da Criptare:</label>
                        <textarea id="text-input" placeholder="Inserisci il testo qui..."></textarea>
                        
                        <label for="password-input">Password:</label>
                        <input type="text" id="password-input" placeholder="Inserisci la password...">
                        
                        <div class="button-group">
                            <button class="crypt-button" id="crypt-button">Cripta</button>
                        </div>

                        <label for="crypted-text-output">Testo Criptato:</label>
                        <div class="text-crypter-result" id="crypted-text-output">
                            <button class="copy-button" id="copy-button" style="display: none;">Copia</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);

            const modalOverlay = document.getElementById('crypter-modal-overlay');
            const closeButton = document.getElementById('close-modal');
            const cryptButton = document.getElementById('crypt-button');
            const copyButton = document.getElementById('copy-button');
            const textInput = document.getElementById('text-input');
            const passwordInput = document.getElementById('password-input');
            const outputDiv = document.getElementById('crypted-text-output');

            // Ripristina i valori salvati
            textInput.value = savedData.text;
            passwordInput.value = savedData.password;
            outputDiv.textContent = savedData.result;

            if (savedData.result) {
                // Aggiungi il pulsante di copia se c'è un risultato
                outputDiv.appendChild(copyButton);
                copyButton.style.display = 'block';
            }

            const closeModal = () => {
                // Salva i valori attuali prima di chiudere
                savedData.text = textInput.value;
                savedData.password = passwordInput.value;
                savedData.result = outputDiv.textContent.replace('Copia', '').trim(); // Pulisci la stringa prima di salvare
                modalOverlay.remove();
            };

            closeButton.addEventListener('click', closeModal);
            modalOverlay.addEventListener('click', (event) => {
                if (event.target === modalOverlay) {
                    closeModal();
                }
            });

            cryptButton.addEventListener('click', async () => {
                const text = textInput.value;
                const password = passwordInput.value;
                
                if (!text || !password) {
                    outputDiv.textContent = 'Per favore, inserisci sia il testo che la password.';
                    outputDiv.style.color = '#ff6b6b';
                    copyButton.style.display = 'none';
                    return;
                }

                const encryptedBytes = await saveXOR({ message: text }, password);
                
                const hexString = Array.from(encryptedBytes)
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join('');

                outputDiv.textContent = hexString;
                outputDiv.style.color = '#71c771';

                // Aggiungi il pulsante di copia dopo la cifratura
                outputDiv.appendChild(copyButton);
                copyButton.style.display = 'block';
            });

            copyButton.addEventListener('click', () => {
                const textToCopy = outputDiv.textContent.replace('Copia', '').trim(); // Rimuovi il testo del bottone
                navigator.clipboard.writeText(textToCopy).then(() => {
                    console.log('Testo criptato copiato negli appunti!');
                }).catch(err => {
                    console.error('Errore durante la copia del testo: ', err);
                });
            });
        };

        btn.addEventListener('click', showModal);

        const menu = document.querySelector('#comfyui-body-top .comfyui-menu');
        const children = menu.children;
        if (children.length >= 3) {
            menu.insertBefore(btn, children[children.length - 3]);
        } else {
            menu.appendChild(btn);
        }
    }
});


async function deriveKey(password, length) {
    const passwordBytes = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', passwordBytes);
    const sha = new Uint8Array(hashBuffer);
    const key = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
        key[i] = sha[i % sha.length];
    }
    return key;
}

async function xorEncrypt(data, password) {
    const key = await deriveKey(password, data.length);
    const encryptedData = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
        encryptedData[i] = data[i] ^ key[i];
    }
    return encryptedData;
}

async function saveXOR(obj, password) {
    const jsonString = JSON.stringify(obj.message);
    const serializedData = new TextEncoder().encode(jsonString);
    const encryptedData = await xorEncrypt(serializedData, password);
    return encryptedData;
}