# jQuery-Form
  jQuery-Form 工具为简化表单操作而产生, 意在做到一步获取易管理的表单数据, 轻松配置表单验证和数据回填功能.
  
# Version
  * v1.1  
    * `new` 表单回填`backfill`
    * `new` 验证事件自动触发配置: `xx-event`, `xx-event`事件当前支持`keyup`和`blur`. `remote-event`不支持`keyup`, 防止频繁发送URL请求.
    * `new` 日志功能, 获取对象时可指定是否打印日志
      ```javascript    
      
      // showLog      : true-开启日志功能, false-关闭日志功能
      // 日志消息格式 : 
      // [local] [caller] [date-time] - message
      // [http://localhost:8080/formUtil/js/Form.js:831:5] [Form] [2016-06-25 19:21:44] - "Create form instance."
      var form = new Form($formContainer, showLog);
      ```
    * `new` 配置查看功能
      ```javascript
      // 查看配置目录
      Form.dir;
      
      // 查看表单验证可配置关键字
      // ATTRIBUTES   : 在HTML代码中可配置的属性
      // EVENTS       : 可配置的验证事件, 详情查看 new Form().registerEvents(events)
      Form.dir.KEYS.validate;
      
      // 查看表单回填可配置关键字
      // ATTRIBUTES   : 在HTML代码中可配置的属性
      // HANDLERS     : 可配置的数据处理器, 详情查看 new Form().registerEvents(events)
      Form.dir.KEYS.backfill;
      
      // 查看Form提供的默认配置
      // autoEvents   : 表单项自动注册事件配置
      // dataHandlers : 表单数据处理器, 当前提供date处理器, 可在HTML中配置(查看Form.dir.KEYS.backfill)
      // events       : 默认事件列表
      // selectors    : Form支持的表单项列表
      // validators   : 默认验证器列表
      Form.dir.config;
      ```
  * v1.0  
    提供基础功能:
    * 获取表单数据
    * 表单校验
  
# 将`jQuery-Form`导入到项目中
  * [`下载`](https://github.com/git8023/jQuery-Form-Util/archive/master.zip)项目到本地
  * 解压后提取3个文件:`Form.js`, `StringUtil.js`, `prototype.js`
  * 文件引入顺序:
    * jQuery库: jQuery 1.8+
    * 原型扩展:`prototype.js`
    * 字符串工具:`StringUtil.js`
    * 表单工具:`Form.js`.

# 如何使用
  表单容器不强制性依赖`form`控件, 表单容器可以是任意控件元素.<br>
  但应确保表单容器中包含合法(name属性值)的表单项控件, 如: `input`,`select`,`textarea`.
  
## 获取表单对象
  ```javascript
  var formContainerSelector = 'div#form-container form:eq(0)';
  // 表单容器选择器除了可以直接指向form控件之外, 也可以使用其父容器.
  // 但应确保容器中只存在一个表单对象
  // formContainerSelector = 'div#form-container';
  var form = new From(formContainerSelector);
  ```
    
## 获取表单数据
  ```javascript
  // 获取表单数据调用getData函数
  var formData = form.getData();
  ```
  
  该函数不接受任何参数, 其返回值是Object对象. 对象中仅包含一级属性.<br>
  可使用`for-in`迭代出所有属性, 且属性名总是与表单项的`name属性值`对应.<br>
  * 如果表单项可接受多个值, 对应的表单值将使用`Array`对象保存 相关控件包括:`input[type='checkbox']`,`select[multiple='multiple']`<br>
    ```javascript
    var hobbies = formData['hobbies']; // (hobbies instanceof Array) ==  true
    ```
  
  * 如果表单项只接受唯一值, 对应的表单值将使用`String`类型保存
    ```javascript
    var account = formData['account']; // (typeof account == 'string') == true
    ```
    
## 表单验证<br>
  表单验证器通过`Form.dir.config.validators`查询, 当前默认支持的验证器:<br>
  正则表达式: `regexp`, `eq-to`, `not-eq-tob`<br>
  远程验证: `remote-url`<br>

  * `HTML`中配置验证器<br>
    验证器配置项通过`Form.dir.KEYS.validate.ATTIBUTES`查询, 当前可配置项如下示例:
    ```html
    <!-- 仅配置验证器 -->
    <input name="desc" 
      regexp="regexp" 
      eq-to="otherFormControlSelector"
      not-eq-to="otherFormControlSelector"
      remote-url="verificationUrl"
      >
      
    <!-- 也可在指定验证器同时定义错误消息 -->
    <!-- 消息属性名 = 验证器名 + '-error' -->
    <input name="desc" 
      regexp="regexp" 
      regexp-error="Error Message"
      >
    
    <!-- v1.1 -->  
    <!-- 配置表单验证事件触发 -->
    <input name="desc"
      remote-url="verificationUrl"
      remote-event="blur"
      >
    ```
      
  * 执行验证<br>
    同过工具实体调用`validate()`函数执行表单验证, 该函数返回验证结果.
    ```javascript
    var success = form.validate(conf);
    ```
    
    `validate()`函数参数包括2个基本配置和4个事件处理器.
    <table>
      <tr>
        <td colspan=4>基本配置列表</td>
      </tr>
      <tr>
        <th>参数名</th>
        <th>类型</th>
        <th>默认值</th>
        <th>说明</th>
      </tr>
      <tr>
        <td>refreshCached</td>
        <td>Boolean</td>
        <td>false</td>
        <td>刷新表单项缓存. 表单项列表或存在影响验证结果的变动时, 应指定为true.</td>
      </tr>
      <tr>
        <td>validAll</td>
        <td>Boolean</td>
        <td>false</td>
        <td>总是验证所有表单项.<br>true-总是会执行所有已经配置的验证器, false-遇到验证失败时阻止后续验证.<br> <b>远程验证与此配置无关</b></td>
      </tr>
      <tr>
        <td colspan=4>事件处理器配置列表</td>
      </tr>
      <tr>
        <th>事件名</th>
        <th>参数列表</th>
        <th>返回值</th>
        <th>说明</th>
      </tr>
      <tr>
        <td>validSuccess</td>
        <td>item: {jQuery} - 当前表单项<br> value: {String} - 当前值</td>
        <td>--</td>
        <td>每次验证成功都会执行该函数, 如果存在多个验证器将执行多次</td>
      </tr>
      <tr>
        <td>validFailed</td>
        <td>item: {jQuery} - 当前表单项<br> value: {String} - 当前值<br>errMsg: {String} - 错误信息,来源 -error 配置</td>
        <td>--</td>
        <td>每次验证失败都会执行该函数, 如果存在多个验证器将执行多次</td>
      </tr>
      <tr>
        <td>remoteHandler</td>
        <td>item: {jQuery} - 当前表单项.<br> resultData: {Boolean|Object} - 远程响应数据.<br>errMsg: {String} - 错误信息,来源 -error 配置.</td>
        <td>--</td>
        <td>远程验证结果处理器.</td>
      </tr>
      <tr>
        <td>validCompleted</td>
        <td>validResult: {Boolean} - 验证结果</td>
        <td>--</td>
        <td>执行完所有验证后执行该函数</td>
      </tr>
    </table>
      
# 依赖工具
  jQuery 1.8+ <br>
  StringUtil.js (本项目) <br>
  prototype.js (本项目) <br>
  
