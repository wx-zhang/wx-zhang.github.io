<h1 id="news"></h1>

<h2 style="margin: 60px 0px 10px;">News</h2>

<style>
  #scrollableDiv {
    min-height: 100px;
    height: 100px;
    overflow-y: hidden;
    opacity: 1;
    transition: height 0.5s ease-in-out, opacity 0.5s ease-in-out;
  }
</style>

<ul id="scrollableDiv" onmouseover="showScrollbar()" onmouseout="hideScrollbar()">
  <li>[07/20232] Started my internship at Oxford</li>
  <li>[07/2023] One paper accepted to ICCV '23</li>
  <li>[04/2023] One paper accepted to ICML'23</li>
  <li>[01/2022] Started my Ph.D at KAUST</li>
  <li>[12/2021] Defended my master thesis, titled <em>Factorized lifelong machine learning on non-stationary tasks: An algorithm and analysis</em></li>
</ul>

<p></p>
<script>
  function showScrollbar() {
    var div = document.getElementById('scrollableDiv');
    div.style.height = div.scrollHeight + 'px';
    div.style.opacity = 1;
  }
  function hideScrollbar() {
    var div = document.getElementById('scrollableDiv');
    div.style.height = '100px';
    div.style.opacity = 1;
  }
</script>