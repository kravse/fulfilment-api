interface LoggerService {
  logError(errorMsg, code):void;
  logMessage(title, msg, value?):void;
}

class LoggerServiceImpl implements LoggerService {
  public logError(err_msg):void {
    console.info(`---------ERROR---------`);
    console.error(`Message: ${err_msg}`);
  }

  public logMessage(title, msg, value?):void {
    console.info(`---------${title.toUpperCase()}---------`);
    console.info(`Message: ${msg}`);
    if (value) console.info(value);
  }
}

const Logger = new LoggerServiceImpl();
export { Logger };