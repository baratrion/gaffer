// Walking-skeleton title screen. Stories from factory/roadmap.yaml replace the placeholder flow.
export const renderTitleScreen = (root: HTMLElement): void => {
  root.innerHTML = `
    <section class="title-screen">
      <h1>Gaffer</h1>
      <p class="tagline">One club. One season. Your call.</p>
      <button type="button" class="primary" id="new-game">New game</button>
    </section>
  `;
};
