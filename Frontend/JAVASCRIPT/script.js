/* HAMBURGER */
const hamburger=document.getElementById("hamburger");
const menu=document.querySelector(".menu");

hamburger.onclick=()=>{
 menu.classList.toggle("active");
};

/* DARK MODE */
const toggle=document.querySelector(".toggle-state");

toggle.addEventListener("change",()=>{
 document.body.classList.toggle("dark-mode");
});
