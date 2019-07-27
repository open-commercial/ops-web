import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.sass']
})
export class MenuComponent implements OnInit {
  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.getItems();
  }

  getItems() {
    let items: MenuItem[] = [{label: 'SIC-OPS'}];
    if (this.authService.isAuthenticated()) {
      items = items.concat([
        {
          label: 'Sistema',
          icon: 'pi pi-fw pi-file',
          items: [{
            label: 'New',
            icon: 'pi pi-fw pi-plus',
            items: [
              {label: 'Project'},
              {label: 'Other'},
            ]
          },
            {label: 'Open'},
            {separator: true},
            {label: 'Quit'}
          ]
        },
        {
          label: 'Compras',
          icon: 'pi pi-fw pi-pencil',
          items: [
            {label: 'Delete', icon: 'pi pi-fw pi-trash'},
            {label: 'Refresh', icon: 'pi pi-fw pi-refresh'}
          ]
        },
        {
          label: 'Ventas',
          icon: 'pi pi-fw pi-question',
          items: [
            {
              label: 'Contents'
            },
            {
              label: 'Search',
              icon: 'pi pi-fw pi-search',
              items: [
                {
                  label: 'Text',
                  items: [
                    {
                      label: 'Workspace'
                    }
                  ]
                },
                {
                  label: 'File'
                }
              ]
            }
          ]
        },
        {
          label: 'Administración',
          icon: 'pi pi-fw pi-cog',
          items: [
            {
              label: 'Edit',
              icon: 'pi pi-fw pi-pencil',
              items: [
                {label: 'Save', icon: 'pi pi-fw pi-save'},
                {label: 'Update', icon: 'pi pi-fw pi-save'},
              ]
            },
            {
              label: 'Other',
              icon: 'pi pi-fw pi-tags',
              items: [
                {label: 'Delete', icon: 'pi pi-fw pi-minus'}
              ]
            }
          ]
        },
        {separator: true},
        {
          label: 'Stock', icon: 'pi pi-fw pi-times'
        }
      ]);
    }
    return items;
  }
}
