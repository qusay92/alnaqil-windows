import { Component, Renderer2, Inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'AbbasMotor';

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private translate: TranslateService,
    @Inject(DOCUMENT) private document: Document
  ) {
    // Initialize language and direction
    this.initializeLanguage();

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.handleBodyClass(event.urlAfterRedirects);
      }
    });

    // Listen for language changes
    this.translate.onLangChange.subscribe(() => {
      this.updateHtmlAttributes();
    });
  }

  private initializeLanguage(): void {
    // Get current language from localStorage or default to 'ar'
    const currentLang = localStorage.getItem('currantLang') || 'ar';

    // Validate language
    if (currentLang !== 'ar' && currentLang !== 'en') {
      localStorage.setItem('currantLang', 'ar');
    }

    // Update HTML attributes on initialization
    this.updateHtmlAttributes();
  }

  private updateHtmlAttributes(): void {
    const currentLang = localStorage.getItem('currantLang') || 'ar';
    const htmlElement = this.document.documentElement;

    // Set lang attribute
    htmlElement.setAttribute('lang', currentLang);

    // Set dir attribute for RTL/LTR
    if (currentLang === 'ar') {
      htmlElement.setAttribute('dir', 'rtl');
      this.renderer.addClass(this.document.body, 'rtl');
      this.renderer.removeClass(this.document.body, 'ltr');
    } else {
      htmlElement.setAttribute('dir', 'ltr');
      this.renderer.addClass(this.document.body, 'ltr');
      this.renderer.removeClass(this.document.body, 'rtl');
    }
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
