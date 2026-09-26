import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  menuOpened = false;

  toggleMenu() {
    if (!this.isMobileScreen()) { return; }

    this.menuOpened = !this.menuOpened;
    this.updatePageScroll();
  }

  closeMenu() {
    if (!this.isMobileScreen() || !this.menuOpened) { return; }

    this.menuOpened = false;
    this.updatePageScroll();
  }

  private isMobileScreen(): boolean {
    return window.matchMedia('(max-width: 991.98px)').matches;
  }

  private updatePageScroll() {
    const elems = document.getElementsByClassName('ops-web-app');
    const appElement = elems.item(0);
    if (this.menuOpened && appElement) {
      appElement.classList.add('menu-opened');
    } else if (appElement) {
      appElement.classList.remove('menu-opened');
    }
  }
}
