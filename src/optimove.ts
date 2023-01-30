import { optimoveSDK } from "./sdk";

export class Optimove {

  private token: string;
  private initialized: boolean;

  constructor(token: string) {
    this.token = token;
    this.initialized = false;
  }

  private async ensureInitialization(): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.initialized = true;
    await new Promise<void>(resolve => {
      optimoveSDK.initialize(this.token, null, resolve, null);
    })    
  }

  async registerUser(userId: string, email: string): Promise<void> {
    await this.ensureInitialization();
    optimoveSDK.API.registerUser(userId, email);
  }

  async setUserId(userId: string): Promise<void> {
    await this.ensureInitialization();
    optimoveSDK.API.setUserId(userId);
  }

  async setEmail(email: string): Promise<void> {
    await this.ensureInitialization();
    optimoveSDK.API.setUserEmail(email);
  }

  async setPageVisit(url: string = location.href, pageTitle: string = document.title, pageCategory?: string): Promise<void> {
    await this.ensureInitialization();

    optimoveSDK.API.setPageVisit(url, pageTitle, pageCategory)
  }
  
  async reportEvent(event: string, params: { [k: string]: any } = {}): Promise<void> {
    await this.ensureInitialization();

    optimoveSDK.API.reportEvent(event, params)
  }
}