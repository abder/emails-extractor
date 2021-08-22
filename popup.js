window.onload = async () => {

    // popup DOM elements 
    const emailsCount = document.getElementById('emails-count');
    const downloadButton = document.getElementById('download-button');
    
    // get the current tab and execute a script within it
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: getEmails,
    });

    // extension recieves the email list and use it
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            const { emails } = request;
            emailsCount.innerHTML = emails.length;

            if ( emails.length > 0 ){
                downloadButton.disabled = false;
                
                downloadButton.addEventListener('click', ()=> {
                    const element = document.createElement('a');
                    element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(emails.join("\n"))}`);
                    element.setAttribute('download', 'emails-list');

                    element.style.display = 'none';
                    document.body.appendChild(element);

                    element.click();

                    document.body.removeChild(element);
                })
            };

            if ( request.emails )
                sendResponse({farewell: "Extension have received the emails list!"});
        }
    );

    // get emails on the current tab and send them to the extension  
    function getEmails() {
        const body = document.querySelector('body');
        let textNode, emails = [], walk = document.createTreeWalker(body,NodeFilter.SHOW_TEXT);
        while(textNode=walk.nextNode()) {
            const regex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
            const foundEmails = textNode.textContent.match(regex);
            if (foundEmails) emails = [...emails, ...foundEmails];
        }

        chrome.runtime.sendMessage({ emails } , function(response) {
            console.log(response.farewell);
        });
    }
    
}