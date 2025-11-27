import { environment } from '../environments/environment';

export class appSettings {
    static webApiUrl = environment.webApiUrl;
    static siteUrl = environment.siteUrl;
    static pageinate = 50
    
    // added code to get the data from the data base per page size
    static pageSize: number;
    static load(): Promise<void> {
      return fetch('/assets/config.json')
        .then(response => response.json())
        .then(config => {
          appSettings.pageSize = config.pageSize;
        });
    }
  }
  