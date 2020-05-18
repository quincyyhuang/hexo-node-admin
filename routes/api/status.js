function Status() {}

Status.getCodeTranslationKey = (code) => {
  for (let [key, value] of Object.entries(Status)) {
    if (code === value)
      return key;
  }
  return null;
}

Status.AUTH_MISSING_CREDENTIALS = 1;
Status.AUTH_INTERNAL_Status = 2;
Status.AUTH_BAD_CREDENTIALS = 3;
Status.AUTH_BAD_HEADERS = 4;
Status.HEXO_FAILED_TO_GET_POSTS = 5;
Status.HEXO_ILLEGAL_FILENAME = 6;
Status.HEXO_FAILED_TO_OPEN_FILE = 7;
Status.HEXO_FAILED_TO_GET_PAGES = 8;
Status.HEXO_FAILED_TO_WRITE_FILE = 9;
Status.HEXO_FAILED_TO_GENERATE = 10;
Status.HEXO_FAILED_TO_CLEAN = 11;
Status.HEXO_FAILED_TO_DEPLOY = 12;
Status.HEXO_BAD_DEPLOY_TYPE = 13;
Status.HEXO_FAILED_TO_GET_STATS = 14;
Status.HEXO_ILLEGAL_FILE_TYPE = 15;
Status.HEXO_FAILED_TO_GET_CONFIG = 16;
Status.HEXO_POST_ASSETS_DISABLED = 17;
Status.HEXO_NO_POST = 18;
Status.HEXO_NO_PAGE = 19;
Status.HEXO_FAILED_TO_CREATE_ASSET_FOLDER = 20;
Status.HEXO_FAILED_TO_UPLOAD_FILE = 21;
Status.HEXO_FAILED_TO_GET_ASSETS = 22;
Status.HEXO_FAILED_TO_DELETE = 23;
Status.HEXO_FAILED_TO_CREATE = 24;

Status.NETWORK_FAILED = 25;
Status.NO_FILES_SELECTED = 26;
Status.TOO_MANY_FILES_SELECTED = 27;

Status.HEXO_WROTE_TO_FILE = -1;
Status.HEXO_GENERATED = -2;
Status.HEXO_CLEANED = -3;
Status.HEXO_DEPLOYED = -4;
Status.HEXO_UPLOADED = -5;
Status.HEXO_DELETED = -6;
Status.HEXO_CREATED = -7

Status.AUTH_LOGGED_IN = -8;
Status.AUTH_LOGGED_OUT = -9;
Status.AUTH_NOT_LOGGED_IN = -10;

module.exports = Object.freeze(Status);