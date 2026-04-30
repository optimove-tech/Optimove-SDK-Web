import { optimoveSDK } from './sdk';

export default class Optimove {
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

    await new Promise<void>((resolve) => {
      optimoveSDK.initialize(this.token, null, resolve, null);
    });
    this.initialized = true;
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

  async setPageVisit(
    url: string = location.href,
    pageTitle: string = document.title,
    pageCategory?: string,
  ): Promise<void> {
    await this.ensureInitialization();

    optimoveSDK.API.setPageVisit(url, pageTitle, pageCategory);
  }

  async reportEvent(
    event: string,
    params: { [k: string]: string | number | boolean } = {},
  ): Promise<void> {
    await this.ensureInitialization();

    optimoveSDK.API.reportEvent(event, params);
  }

  async gamifyWidgetOpen(widgetUrl: string, userId?: string, token?: string): Promise<void> {
    await this.ensureInitialization();
    optimoveSDK.API.gamifyWidgetOpen(widgetUrl, userId, token);
  }

  async gamifyWidgetClose(): Promise<void> {
    await this.ensureInitialization();
    optimoveSDK.API.gamifyWidgetClose();
  }
}
