import { Component, Renderer2 } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'AbbasMotor';

  constructor(private router: Router, private renderer: Renderer2) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.handleBodyClass(event.urlAfterRedirects);
      }
    });
  }

  private handleBodyClass(url: string): void {
    const body = document.body;

    if (url === '/' || url === '' || url.includes('#')) {
      this.renderer.addClass(body, 'loaded');
    } else {
      this.renderer.removeClass(body, 'loaded');
    }
  }
}
