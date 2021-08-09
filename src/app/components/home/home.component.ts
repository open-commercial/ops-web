import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  menuOpened = false;

  toggleMenu() {
    this.menuOpened = !this.menuOpened;
    const elems = document.getElementsByClassName('sic-ops-web-app');
    const appElement = elems.item(0);
    if (this.menuOpened && appElement) {
      appElement.classList.add('menu-opened');
    } else {
      appElement.classList.remove('menu-opened');
    }
  }
}
