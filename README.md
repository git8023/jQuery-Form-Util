# jQuery-Form
  jQuery-Form 工具为简化表单操作而产生, 意在做到一步获取易管理的表单数据, 轻松配置表单验证和数据回填功能.
  
# Main API
  接口                                         | 参数                       | 返回值
  -------------------------------------------- | -------------------------- | -------------------------
  Form(formContainer, debug) | `formContainer`类型:jQuery, 表单控件或表单容器<br>`debug`类型:Boolean, true-打印调试日志 | 返回[Form实例对象]( "通过new关键字获取实例对象")或[Form函数执行环境]( "直接调用Form()函数")
  getData(refreshCached) | `refreshCached`类型:Boolean, true-使用缓存的表单项(表单项有变动时使用当前值), false-刷新表单项缓存 | 与`name`属性值一一对应的表单数据对象
  getFormItems(refreshCached) | `refreshCached`类型:Boolean, true-使用缓存的表单项(表单项有变动时使用当前值), false-刷新表单项缓存 | 表单项控件列表对象[formItem]( "也可使用$form.formItem直接访问"). 其中`formItem.singleValItems`保存只接受一个值的表单控件(也包含select[multiple]); `formItem.repeatableItems`保存接受多个值的表单项控件
  validate(validationConf) | `refreshCached`:Boolean, (Default:false) 刷新表单项缓存<br>`validAll`:Boolean, (Default:false) true-总是验证所有表单项, false-遇到验证失败时停止验证.<b>远程验证与此配置无关</b><br><br>以下验证结果处理器会覆盖`Form.registerEvents()`已经注册的验证结果处理器<br>`validSuccess`:Function, 验证通过回调函数. 参数:{$formItemControl, itemValue}<br>`validFailed`:Function, 验证失败回调函数. 参数:{item, value, errMsg(xx-error属性值)}<br>`remoteHandler`:Function, 远程验证回调函数. 参数:{item, resultData}<br>`validCompleted`:Function, 验证完成后回调函数. 参数:{validResult} | 验证结果(Boolean), true-验证通过, false-验证失败
  getNamedFormControl() | -/- | 表单项控件数组, 按`HTML`中定义的顺序
  registerEvents(events) | `refreshAutoEvent`:Boolean, true-刷新自动注册的事件 <br><br><b>验证事件列表:</b><br>[validSuccess]( "验证成功回调函数"), [validFailed]( "验证失败回调函数"), [remoteHandler]( "远程验证回调函数"), [validCompleted]( "验证完成回调函数")<br><br><b>表单回填事件:</b><br>`beforeHandle`:表单项回填前置处理函数, 参数:{$formItemControl, targetValue}, 返回值:false-阻止后续回填<br>`namesHandler`类型:Object, 按表单项[name]属性值定义的前置处理函数. Key(String)-表单项的`name`属性;Value(Function)-前置处理函数(与`beforeHandler`配置相同) | -/-
  backfill(backfillConf) | `formData`类型:Object, 需要回填的表单数据, Key值与`name`属性对应.<br>[beforeHandler]( "参考registerEvents")覆盖已注册的处理器(`registerEvents`), [namedHandlers]( "参考registerEvents")覆盖已注册的处理器(`namedHandlers`) | -/-
  
# Version
  * `new` v1.1  
    * `new` 表单回填`backfill`
    * `new` 验证事件自动触发配置: `[validator-name]-event`, `[validator-name]-event`事件当前支持`keyup`和`blur` (注意:为防止频繁发送URL请求`remote-event`仅支持`blur`).
    * `update` 日志功能, 获取对象时可指定是否打印日志
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
    * `new` 将`Form`集成到`jQuery`库
      ```javascript  
      
      // 获取表单容器
      var formCtnr = $($formContainerSelector);
      
      // 构建表单对象
      // 如果对Form工具使用较为熟悉, 推荐jQuery扩展构建方式
      // 对于初次接触Form的使用者, 推荐Javascript原生构建方式: new Form(formContainer, showLog);
      // 使用new关键字构建的对象在一些开发工具(如:eclipse)中可以提供接口提示功能
      var form = formCtnr.form(showLog);
      ```
  * v1.0  
    提供基础功能:
    * 获取表单数据
    * 表单校验
  
# 将`jQuery-Form`导入到项目中
  * [`下载`](https://github.com/git8023/jQuery-Form-Util/archive/master.zip)项目到本地
  * 解压后提取`/release/util`内的工具所有工具文件, 和`/release/vx.x`下的最新版本`Form.js`文件
  * 文件引入顺序:
    * jQuery库         : jQuery 1.8+
    * 原型扩展         : [prototype.js](https://github.com/git8023/jQuery-Form-Util/blob/master/release/v1.1/OgnlUtil.js "原型扩展")
    * 工具             : [StringUtil.js](https://github.com/git8023/jQuery-Form-Util/blob/master/release/v1.1/StringUtil.js "字符串工具"), [OgnlUtil.js](https://github.com/git8023/jQuery-Form-Util/blob/master/release/v1.1/OgnlUtil.js "OGNL工具,V1.1新增")
    * 表单工具         : [Form.js](https://github.com/git8023/jQuery-Form-Util/blob/master/release/v1.1/Form.js "表单工具")

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
  jQuery 1.8+  
  StringUtil.js (本项目)  
  prototype.js  (本项目)   
  OgnlUtil.js   (本项目) 
  
