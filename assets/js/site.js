(() => {
  const button = document.querySelector('#start-project');
  if (!button) return;
  button.addEventListener('click', () => {
    // Entra al espacio técnico; no se presenta como una partida jugable.
    window.location.href = './original-port/#web-runner';
  });
})();