;(function () {
  var calendar = {
    curDate: new Date(),
    holidays: [
      '假期安排',
      '元旦',
      '除夕',
      '春节',
      '清明节',
      '劳动节',
      '端午节',
      '中秋节',
      '国庆节',
    ],

    init() {
      this.renderSelect(this.curDate); //渲染下拉列表
      this.getData(this.curDate);
    },
    // 数据渲染
    renderSelect(d) {
      var yearList = document.querySelector('.yearSelect .selectBox ul'),
          monthList = document.querySelector('.montSelect .selectBox ul'),
          holidayList = document.querySelector('.holidaySelect .selectBox ul'),
          yearSelected = document.querySelector('.yearSelect .selected span'),
          monthSelected = document.querySelector('.montSelect .selected span');
          holidaySelected = document.querySelector('.holidaySelect .selected span')
      // console.log(yearList, monthList, holidayList, yearSelected, monthSelected);

      // 生成年份
      var li = '';
      for(var i = 1900; i < 2050; i++){
        li += `<li ${i == d.getFullYear() ? 'class="active"' : ''}>${i}年</li>`;
      }
      yearList.innerHTML = li;
      yearSelected.innerHTML = d.getFullYear() + '年';


      // 生成月份
      var li = '';
      for (var i = 1; i <= 12; i++) {
        li += `<li ${i == (d.getMonth() + 1) ? 'class="active"' : ''}>${i}月</li>`;
      }
      monthList.innerHTML = li;
      monthSelected.innerHTML = (d.getMonth() + 1) + "月";

      // 生成假期
      var li = '';
      for (var i = 0; i < this.holidays.length; i++) {
        li += `<li ${i == 0 ? 'class="active"' : ''}>${this.holidays[i]}</li>`;
      }
      holidayList.innerHTML = li;
      holidaySelected.innerHTML = this.holidays[0];
      
      this.selectBindEvent() // 添加事件
    },
    closeSelect() { //关闭下拉框
      // 类数组，不能使用find方法. 类数组转换为数组
      var selects = [...document.querySelectorAll('.select')];
      // selects.find((select) => select.classList.contains('active'));

      var open = selects.find(select => select.classList.contains('active'));
      // 只有找到有 active 的元素后才能删除这个class
      open && open.classList.remove('active');
      // var selects = [...document.querySelectorAll('.select')];
      // for(var i = 0; i < selects.length; i++) {
      //   selects[i].classList.remove('active');
      // }
    },
    selectBindEvent() { // 下拉框添加事件添加
      var selects = document.querySelectorAll('.select');
      selects.forEach( (select, index) => {
        var cl = select.classList;
        // 点击的那个下拉框的选中的内容
        var selected = select.querySelector('span');

        select.onclick = (event) => {
          var event = event || window.event,
              target = event.target;  // 事件源
          if(cl.contains('active')){ // 检测 active 是否存在
            // 删除 active
            cl.remove('active');
          } else {
            // 移出所有人的 active
            this.closeSelect();
            // 添加 active
            cl.add('active');
            this.scrollBar();
          }

          if(target.tagName !== 'LI') {
            // 说明点击的不是列表
            return;
          }

          // 点击的是 li
          var lis = [...select.querySelectorAll('ul li')];
          lis.find((li) => li.classList.contains('active')).classList.remove('active');
          target.classList.add('active');

          // 根据索引值区分点击的是谁
          switch(index) {
            case 0: // 点击的是年
              this.curDate.setFullYear(parseInt(target.innerHTML)); // 去掉中文
              // 设置年份
              selected.innerHTML = target.innerHTML;
              break;
            case 1: // 点击的是月
            this.curDate.setMonth(parseInt(target.innerHTML) - 1);
              selected.innerHTML = target.innerHTML;
              break;
            case 2: // 点击的是假期
              selected.innerHTML = target.innerHTML;
              break;
          }

          // 数据请求
          this.getData(this.curDate);    
        };
      })
      // 添加切换月份
      this.monthChange();
      // 返回今天功能
      this.backToday();
    },
    scrollBar() { //滚动条
      // 可视内容区域、内容总高度、 滚动条的高度、滑块高度
      var scrollWrap = document.querySelector('.yearSelect .selectBox'),
          content = document.querySelector('.yearSelect .selectBox ul'),
          barWrap = document.querySelector('.yearSelect .selectBox .scroll'),
          bar = document.querySelector('.yearSelect .selectBox span');
      
      // 初始化
      bar.style.transform = content.style.transform = 'translateY(0)';
      // 设置滑块的高度  内容的内容父级的几倍
      var multiple = (content.offsetHeight + 18) / scrollWrap.offsetHeight; 
      // 设置倍速的最大值为 20 
      multiple = multiple > 20 ? 20 : multiple;
      // 根据倍速算出滑块的高度(相反的关系)
      bar.style.height = parseInt(scrollWrap.offsetHeight / multiple) + 'px';
      
      // 滑块拖拽
      // 滚动条走的距离
      var scrollTop = 0,
      // 滑块能走的最大距离
          maxHeight = barWrap.offsetHeight - bar.offsetHeight;
      
      bar.onmousedown = function(event) {
        // 鼠标按下时相对于父级的坐标
        var startY = event.clientY,
        // ['translateY', '0)'] 按下时元素走的距离
            startT = parseInt(this.style.transform.split('(')[1]);
        
      bar.style.transition = content.style.transition = null;
        document.onmousemove = (event) => {
          scrollTop = event.clientY - startY + startT;

          // 滑动功能
          scroll();
        }
        // 鼠标抬起 停止
        document.onmouseup = () => document.onmousemove = null;
      }

      // 在滑动时阻止事件冒泡
      barWrap.onclick = (event) => {
        event.stopPropagation();
      }

      function scroll() {
        // console.log("滑动了");
        if(scrollTop < 0) {
          scrollTop = 0;
        }
        if(scrollTop > maxHeight) {
          scrollTop = maxHeight;
        }

        var scaleY = scrollTop / maxHeight;
        // 滑块的距离
        bar.style.transform = 'translateY('+ scrollTop +"px)";
        // 内容的距离
        content.style.transform = 'translateY('+ (scrollWrap.offsetHeight
          - content.offsetHeight - 18) * scaleY +"px)";
      }

      // 滚轮滚动事件
      scrollWrap.onwheel = (event) => {
        // deltaY > 0是往下走 小于 0 是往上走 
        event.deltaY > 0 ? scrollTop += 10 : scrollTop -= 10;
        bar.style.transition = content.style.transition = '.2s';
        scroll();
        // 阻止默认行为
        event.preventDefault();
      }
    },
    // 请求数据
    getData(d) {
      $.ajax({
        method: 'get',
        url: `https://www.rili.com.cn/rili/json/pc_wnl/${d.getFullYear()}/${d.getMonth()+1}.js`,
        dataType: 'jsonp',
        // success: function(res) {
        //   console.log(res);
        // }
      });

      // 一定要把jsonp里面的函数定义成全局的
      window.jsonrun_PcWnl = (res) => {
        // console.log(res);
        // 渲染日期
        this.renderDate(d, res.data);

        // 渲染农历
        this.renderLunar(res.data.find(item => item.nian==d.getFullYear() && item.yue == d.getMonth() + 1 && item.ri == d.getDate()));
      }
    },
    // 获取到某个月的最后一天的日期。月份时几月就传几月不用+1 或者-1
    getEndDay: (year, month) => new Date(year, month, 0).getDate(),
    // 获取某个月的第一天周几，月份是几月就传几月
    getfirstWeek: (year, month) => new Date(year, month - 1, 1).getDay(),
    // 正则匹配 替换标签为空 只保留文本
    delTag: (str) => str.replace(/<\/?.+?\/?>/g, ''),
    // 补零
    repair: str => str < 10 ? '0' + str : str,
    // 渲染日期
    renderDate(d, data){
      // console.log(this.getfirstWeek(2021, 12));
      var tbody = document.querySelector('.dateWrap tbody');
      // 上个月的最后一天，月份不需要计算
      var lastEndDay = this.getEndDay(d.getFullYear(), d.getMonth());
      // 当前月的最后一天，月份需要+1
      var curEndDay = this.getEndDay(d.getFullYear(), d.getMonth() + 1);
      // 当前月的第一天是周几
      var week = this.getfirstWeek(d.getFullYear(), d.getMonth() + 1);

      // console.log(data);

      // 上个月占几个格子
      var lastDateNum = week - 1;
      // 如果当前月的第一天是周日，那week的值就为0，这个时候需要给上个月留出6个格子
      lastDateNum = week == 0 ? 6 : lastDateNum;
      // 上个月的起始日期。这个值是少了1 ，是因为最后一天的格子它页减去了，这个格子不能减去
      var prevStarDate = lastEndDay - lastDateNum;
      // 下个月起始日期
      var nextStarDate = 1;
      // 当前月起始日期
      var curStartDate = 1;

      var calendar = document.querySelector('#calendar');
      // 如果之前已经有添加了，要想取消在添加
      calendar.classList.remove('active');

      // console.log(prevStarDate);
      // 记录42次循环走的每一次
      var cn = -1  
      tbody.innerHTML = '';
      for(var i = 0; i < 6; i++){
        var tr = document.createElement('tr');
        var td = '';
        for(var j = 0; j < 7; j++){
          // td += `<td></td>`;
          cn++;

          var festival = data[cn].jie ? this.delTag(data[cn].jie) : data[cn].r2;
          var weekday = data[cn].jia == 90 ? 'weekday' : ''; // 班
          var holiday = data[cn].jia > 90 ? 'holiday' : '';  // 休

          // 走的是上个月的日期
          if (cn < lastDateNum) {  
            td += `<td>
                      <div class="prevMonth ${ weekday +' '+ holiday }">
                        <span>${++prevStarDate}</span>
                        <span>${festival}</span>
                      </div>
                  </td>`;
          // 走的是下个月的日期
          } else if(cn >= lastDateNum + curEndDay) { 
            td += `<td>
                      <div class="nextMonth ${ weekday +' '+ holiday }">
                        <span>${nextStarDate++}</span>
                        <span>${festival}</span>
                      </div>
                  </td>`;
          } else { // 走的是当前月的日期
            var cl = '';
            // 当月日期于当前日期对象(this.curDate)进行对比
            if(curStartDate == d.getDate()){
              cl = ' active';
            }
            if(new Date().getFullYear() == d.getFullYear() &&
              new Date().getMonth() == d.getMonth() &&
              new Date().getDate() == d.getDate() &&
              d.getDate() == curStartDate){
              cl += ' today';
            }

            td += `<td>
                      <div class="${cl+' '+ weekday +' '+ holiday }">
                        <span>${curStartDate++}</span>
                        <span>${festival}</span>
                      </div>
                  </td>`;
            
            if (cl.indexOf('active') != -1 && holiday == 'holiday') {
              // 只有节假日，最外层的父级需要添加红色class
              var curDay = this.delTag(data[cn].jie);
              this.holidays.includes(curDay) && calendar.classList.add('active');
              
              /**
               * 添加红色active条件
               * 1、当前的格子必需有active的class，表示激活状态
               * 2、当前的格子必需有holiday的class,表示是个节日
               * 3、节日必须为this.holidays中的某一个
              */
            }
          }

          tr.innerHTML = td;
        }

        tbody.appendChild(tr);
      }
      this.dateBindEvent(data);
    },
    // 切换月份
    monthChange() {
      var arrows = document.querySelectorAll('.arrow');
      
      // 上个月
      arrows[0].onclick = () => {
        // 月份加1
        this.curDate.setMonth(this.curDate.getMonth() - 1 );
        // 重新渲染下拉框
        this.renderSelect(this.curDate);
        // 重新渲染日期内容
        this.getData(this.curDate);
        // 清除下拉框
        this.closeSelect();
      }
      // 下个月
      arrows[1].onclick = () => {
        // 月份加1
        this.curDate.setMonth(this.curDate.getMonth() + 1 );
        // 重新渲染下拉框
        this.renderSelect(this.curDate);
        // 重新渲染日期内容
        this.getData(this.curDate);
        // 清除下拉框
        this.closeSelect();
      }
    },
    // 返回今天功能
    backToday() {
      var returnBtn = document.querySelector('#calendar .topBar button');
      returnBtn.onclick = () => {
        this.curDate = new Date();
        this.renderSelect(this.curDate);
        this.getData(this.curDate);
        this.closeSelect();
      }
    },
    // 日期点击功能
    dateBindEvent(data) {
      // console.log(data);
      // 选项ka
      var boxes = [...document.querySelectorAll('.dateWrap tbody td div')];
      var last = boxes.find(box => box.classList.contains('active'));
      
      // 获取当前的年份
      var curYear = this.curDate.getFullYear();
      // 获取当前的月份
      var curMonth = this.curDate.getMonth();

      boxes.forEach((box, index) => box.onclick = () => {
        // 点击的日期
        var date = box.children[0].innerHTML;
        // 选项卡
        var cl = box.classList;
        last && last.classList.remove('active');
        cl.add('active');
        last = box;

        // 隐藏下拉框
        this.closeSelect();

        // 上个月
        if (cl.contains('prevMonth')) {
          this.curDate = new Date(curYear, curMonth - 1, date);
          // 重新渲染下拉框
          this.renderSelect(this.curDate);
          // 重新渲染日期内容
          this.getData(this.curDate);
        // 下个月 
        } else if(cl.contains('nextMonth')) {
          this.curDate = new Date(curYear, curMonth + 1, date);
          // 重新渲染下拉框
          this.renderSelect(this.curDate);
          // 重新渲染日期内容
          this.getData(this.curDate);
        // 点击的当前月
        } else {
          var calendar = document.querySelector('#calendar');
          var curDay = box.children[1].innerHTML;
          // 获取假日是否属于 this.holidays 是就添加active
          calendar.className = this.holidays.includes(curDay) ? 'active' : '';

          // 渲染农历 
          this.renderLunar(data[index]);
        }
      });
    },
    // 渲染农历
    renderLunar(data) {
      // console.log(data);
      var date = document.querySelector('.right .date'),
          day =  document.querySelector('.right .day'),
          ps =  document.querySelectorAll('.right .lunar p'),
          holidayList =  document.querySelector('.right .holidayList');
      date.innerHTML = data.nian + '-' + this.repair(data.yue) + '-' + this.repair(data.ri);
      day.innerHTML = data.ri;
      ps[0].innerHTML = data.n_yueri;
      ps[1].innerHTML = data.gz_nian + "年 " + data.shengxiao;
      ps[2].innerHTML = data.gz_yue+'月 '+ data.gz_ri + '日';

      // 节日
      var holidays = this.delTag(data.jieri).split(',');
      holidays = holidays.length > 2 ? holidays.slice(0, 2) : holidays;
      holidayList.innerHTML = '';
      holidays.forEach( holiday => holidayList.innerHTML += `<li>${holiday}</li>`);

      // 宜忌
      var defaultDl = document.querySelectorAll('.suit .default dl');
      var hoverDl = document.querySelectorAll('.suit .hover dl');
      
      // 渲染宜
      defaultDl[0].innerHTML = '<dt>宜</dt>';
      data.yi.forEach(yi => defaultDl[0].innerHTML += `<dd>${yi}</dd>`);
      // 渲染忌
      defaultDl[1].innerHTML = '<dt>忌</dt>';
      data.ji.forEach(ji => defaultDl[1].innerHTML += `<dd>${ji}</dd>`);

      // hover 对应的结构
      var str = data.yi.join('、');
      hoverDl[0].innerHTML = `<dt>宜</dt><dd>${str}</dd>`;
      var str = data.ji.join('、');
      hoverDl[1].innerHTML = `<dt>忌</dt><dd>${str}</dd>`;
    }
  };

  calendar.init()
})()
