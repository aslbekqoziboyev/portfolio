let nam = prompt("Ismingizni kiriting");
document.getElementById("hi").innerText = `Assalomu alaykum, ${nam} . Men Developer Aslbekman.`;
function send(){
    let name = document.getElementById("name").value.trim();
    let mail = document.getElementById("email").value.trim();
    let xat = document.getElementById("xat").value.trim();

    if(name === "" || mail === "" || xat === ""){
        alert("So'rov yuborilmadi!");
        return;
    } else {
        alert("So'rov muvaffaqiyatli yuborildi!");
    }
}
window.addEventListener("load", function () {
        document.body.classList.add("loaded");
    });
function sty(){
    let div = document.getElementById("div");
    div.style.opacity = "100%"
}
function searchFunction() {
            let input = document.getElementById("searchBar").value.toLowerCase();
            let sections = document.getElementsByTagName("section");
            for (let i = 0; i < sections.length; i++) {
                let text = sections[i].innerText.toLowerCase();
                if (text.includes(input)) {
                    sections[i].style.display = "block";
                } else {
                    sections[i].style.display = "none";
                }
            }
        }
  const toggle = document.getElementById('theme-toggle');
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    toggle.textContent = '☀️';
  }

  toggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');

    if (document.body.classList.contains('dark-mode')) {
      localStorage.setItem('theme', 'dark');
      toggle.textContent = '☀️';
    } else {
      localStorage.setItem('theme', 'light');
      toggle.textContent = '🌙';
    }
  });