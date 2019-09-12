import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Usuario } from '../../models/usuario';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss']
})
export class TopBarComponent implements OnInit {
  @Output() menuButtonClick = new EventEmitter<void>();

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
    // this.toggleMenu();
  }

  menuBtnClick() {
    this.menuButtonClick.emit();
  }
}
