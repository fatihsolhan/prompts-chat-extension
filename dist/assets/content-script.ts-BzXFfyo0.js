function s(n,a=1e4){return new Promise((r,o)=>{const c=Date.now();if(document.querySelector(n))return r(document.querySelector(n));const e=new MutationObserver(()=>{const t=document.querySelector(n);t?(e.disconnect(),r(t)):Date.now()-c>a&&(e.disconnect(),o(new Error(`Timeout waiting for element: ${n}`)))});e.observe(document.body,{childList:!0,subtree:!0,attributes:!0,characterData:!0})})}chrome.runtime.onMessage.addListener((n,a,r)=>{if(n.action==="insertPrompt"){const{prompt:o,inputSelector:c}=n.data;return(async()=>{try{const e=await s(c);if(e instanceof HTMLTextAreaElement)e.value=o,e.dispatchEvent(new Event("input",{bubbles:!0})),e.focus();else if(e instanceof HTMLElement){e.innerHTML=o,e.dispatchEvent(new Event("input",{bubbles:!0})),e.dispatchEvent(new Event("change",{bubbles:!0})),e.focus();const t=window.getSelection(),u=document.createRange();t==null||t.removeAllRanges(),u.selectNodeContents(e),u.collapse(!1),t==null||t.addRange(u)}r({success:!0})}catch(e){console.error("Error inserting prompt:",e),r({success:!1,error:e})}})(),!0}});
