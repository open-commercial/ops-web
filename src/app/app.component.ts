import { Component } from '@angular/core';
import { environment } from '../environments/environment';
import { StorageService } from './services/storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'sic-ops-web';
  constructor(private storageService: StorageService) {
    this.checkAppVersion();
  }

  checkAppVersion() {
    if (environment.appVersion !== this.storageService.getItem('app-version')) {
      this.storageService.clear();
    }
  }
}
