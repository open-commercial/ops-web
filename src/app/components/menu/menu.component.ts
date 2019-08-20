import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../models/usuario';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  isCollapsed = true;
  usuario: Usuario = null;

  constructor(public authService: AuthService) { }

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.authService.getLoggedInUsuario().subscribe((u: Usuario) => this.usuario = u);
    }
  }

  logout() {
    this.authService.logout();
    this.toggleMenu();
  }

  toggleMenu() {
    this.isCollapsed = !this.isCollapsed;
  }
}
