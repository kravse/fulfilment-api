interface LoggerService {
  log_error(err_msg):void;
  log_message(title, msg, value?):void;
}

class LoggerServiceImpl implements LoggerService {
  public log_error(err_msg):void {
    console.info(`---------ERROR---------`);
    console.error(`Message: ${err_msg}`);
  }

  public log_message(title, msg, value?):void {
    console.info(`---------${title.toUpperCase()}---------`);
    console.info(`Message: ${msg}`);
    if (value) console.info(value);
  }
}

const Logger = new LoggerServiceImpl();
export { Logger };
