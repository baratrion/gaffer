import "./ui/styles.css";
import { renderTitleScreen } from "./ui/title-screen";

const root = document.querySelector<HTMLElement>("#app");
if (root) renderTitleScreen(root);
