import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { appSettings } from 'src/appSettings/appSettings';
import { LoginService, ResourcesService } from 'src/services';

@Component({
  selector: 'app-base',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.css'],
})
export class BaseComponent implements OnInit {
  hasPermission = true;
paginate=appSettings.pageinate;
  

  constructor(
    public loginService: LoginService,
    public translate: TranslateService,
    public resource: ResourcesService,
    @Inject(DOCUMENT) public document: Document
  ) {

    translate.addLangs(['en', 'ar']);
    translate.setDefaultLang('ar');

    const browserLang = translate.getBrowserLang();

    // Get current language from localStorage with proper validation
    let currentLang = localStorage.getItem('currantLang');

    // Validate and set language
    if (currentLang === 'ar' || currentLang === 'en') {
      translate.use(currentLang);
    } else {
      // Default to Arabic if invalid or not set
      currentLang = 'ar';
      localStorage.setItem('currantLang', currentLang);
      translate.use(currentLang);
    }

    this.resource.currentCulture.subscribe((res) => {
      translate.use(res);
      localStorage.setItem('currantLang', res);
      window.location.reload();
    });

    this.PermissionCheck();
  }

  ngOnInit() {
  }

  PermissionCheck() {
    
    if (!this.loginService.isAdmin()) {
      this.hasPermission = false;
    } else {
      this.hasPermission = true;
    }
  }

  RemoveBlackScreen(){
    this.document.body.classList.remove('modal-open');
    this.document.body.style.removeProperty('overflow');           
    const elements = this.document.documentElement.getElementsByClassName('modal-backdrop');
    while(elements.length > 0){
        elements[0].parentNode?.removeChild(elements[0]);
    }
  }
}
