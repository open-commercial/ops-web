import { Component } from '@angular/core';
import { Rol } from 'src/app/models/rol';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  menuOpened = false;
  rol = Rol;  

  toggleMenu() {
    this.menuOpened = !this.menuOpened;
    const elems = document.getElementsByClassName('ops-web-app');
    const appElement = elems.item(0);
    if (this.menuOpened && appElement) {
      appElement.classList.add('menu-opened');
    } else {
      appElement.classList.remove('menu-opened');
    }
  }

}
