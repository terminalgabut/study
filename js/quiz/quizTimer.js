// root/js/quiz/quizTimer.js

export const quizTimer = {
  interval: null,
  timeLeft: 60,

  start(duration, onTick, onTimeUp) {
    this.stop(); // Pastikan tidak ada timer ganda
    this.timeLeft = duration;
    
    this.interval = setInterval(() => {
      this.timeLeft--;
      onTick(this.timeLeft);

      if (this.timeLeft <= 0) {
        this.stop();
        onTimeUp();
      }
    }, 1000);
  },

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  },

  reset() {
    this.stop();
    this.timeLeft = 60;
  }
};
