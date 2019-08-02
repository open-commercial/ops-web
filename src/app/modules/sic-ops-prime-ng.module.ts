import { NgModule } from '@angular/core';
import {MenubarModule} from 'primeng/menubar';
import {ButtonModule} from 'primeng/button';
import {InputTextModule} from 'primeng/inputtext';
import {PanelModule} from 'primeng/panel';
import {ToastModule} from 'primeng/toast';

import {MessageService} from 'primeng/api';
import {MessagesModule} from 'primeng/messages';
import {MessageModule} from 'primeng/message';
import {SidebarModule} from 'primeng/sidebar';
import {MenuModule} from 'primeng/menu';

@NgModule({
  imports: [
    MenubarModule, ButtonModule, InputTextModule, PanelModule, ToastModule, MessagesModule, MessageModule,
    SidebarModule, MenuModule
  ],
  exports: [
    MenubarModule, ButtonModule, InputTextModule, PanelModule, ToastModule, MessagesModule, MessageModule,
    SidebarModule, MenuModule
  ],
  providers: [
    MessageService,
  ]
})
export class SicOpsPrimeNgModule { }
