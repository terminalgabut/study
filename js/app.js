const buttons = document.querySelectorAll('nav button');
const pages = document.querySelectorAll('.page');

buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    const page = btn.dataset.page;

    pages.forEach(p => p.classList.remove('active'));
    buttons.forEach(b => b.classList.remove('active'));

    document.getElementById(page).classList.add('active');
    btn.classList.add('active');
  });
});
