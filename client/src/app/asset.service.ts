import { Injectable } from '@angular/core';

@Injectable()
export class AssetService {

  constructor() { }

  removeScript(path: string) {
    // TODO: Remove DOM element that has attribute `data-path="${path}"`
  } 
  loadScript(path: string): Promise<any> {
    return new Promise(resolve => {
        const script = document.createElement('script');
        script.type = "text/javascript";
        script.src = path;
        script.async = false;
        script.setAttribute('data-path', path);
        script.onload = () => {
          
          resolve({ loaded: true, status: 'Loaded' });
        };


        script.onerror = (error: any) => resolve({ loaded: false, status: 'Loaded' });
        document.getElementsByTagName('body')[0].appendChild(script);
    });
  }
}
