import { Component } from '@angular/core';
import { LowerCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-footer',
  imports: [LowerCasePipe, RouterLink],
  template: `
    <footer>
      <div class="container">
        <a class="logo-font" routerLink="/">{{ appName | lowercase }}</a>
        <span class="attribution">
          &copy; {{ year }}.
          An interactive learning project from
          <a href="https://thinkster.io">Thinkster</a>.
          Code licensed under MIT.
        </span>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  protected readonly appName = environment.appName;
  protected readonly year = new Date().getFullYear();
}
