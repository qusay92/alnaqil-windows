import { Inject, Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { LanguagesEnum } from "src/enum/LanguagesEnum";

@Injectable({
    providedIn: 'root',
  })

  export class NGTranslateHelperService {

    constructor(private translate: TranslateService) {

    }

    addTranslationJsonFile(fileName: string){
      
    }

    initialization() {
        this.addLangs();
        this.getCurrentLang();
        this.translate.setDefaultLang(LanguagesEnum[LanguagesEnum.Ar]);
        this.useCurrent()
      }


      private addLangs() {
        this.translate.addLangs([LanguagesEnum[LanguagesEnum.En],LanguagesEnum[LanguagesEnum.Ar]]);  
      }

      getCurrentLang() {
        const currentLang = localStorage.getItem("currantLang");

        // Validate language
        if (currentLang !== LanguagesEnum[LanguagesEnum.Ar] &&
            currentLang !== LanguagesEnum[LanguagesEnum.En]) {
          localStorage.setItem("currantLang", LanguagesEnum[LanguagesEnum.Ar]);
          return LanguagesEnum[LanguagesEnum.Ar];
        }

        return currentLang || LanguagesEnum[LanguagesEnum.Ar];
      }

      private useCurrent() {
        this.translate.use(this.getCurrentLang());
      }

  }