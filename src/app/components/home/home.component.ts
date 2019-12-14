import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  menuOpened = false;

  constructor() { }

  ngOnInit() {
  }

  toggleMenu() {
    this.menuOpened = !this.menuOpened;
  }
}
