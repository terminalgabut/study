// TES SEDERHANA UNTUK CEK APAKAH MASIH BLANK
export const performaController = {
  async init() {
    console.log("Controller Performa Berhasil Dimuat!");
    const title = document.getElementById('user-fullname');
    if (title) title.textContent = "Berhasil!";
  }
};
