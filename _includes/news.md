<h1 id="news"></h1>

<h2 style="margin:30px 0px 10px;">News</h2>

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
  <li>[Pinned to top] I am actively seeking for internship in 2025. I am happy to engage in discussions regarding potential opportunities!</li>
  <li>[06/2024] Our <a href="https://arxiv.org/abs/2312.00923">IWMS (Label Delay in CL)</a> paper is accepted to NeurIPS '24! Code and applications are <a href="https://botcs.github.io/label-delay/">here</a> !</li>
  <li>[08/2024] Our <a href="https://arxiv.org/abs/2408.15313">Safety Alignment</a> paper is out on arxiv! Code and applications are coming soon!</li>
  <li>[06/2024] Our <a href="https://arxiv.org/abs/2308.12462">SPU</a> paper is accepted to CVPR '24! Code and applications are <a href="https://wx-zhang.github.io/spu/html/">here</a> !</li>
  <li>[01/2024] One paper accepted to ICLR '24!</li>
  <li>[07/2023] Started my internship at Oxford.</li>
  <li>[07/2023] One paper accepted to ICCV '23!</li>
  <li>[04/2023] One paper accepted to ICML'23!</li>
  <li>[01/2022] Started my Ph.D at KAUST.</li>
  <li>[12/2021] Defended my master thesis, titled <em>Factorized lifelong machine learning on non-stationary tasks: An algorithm and analysis.</em></li>
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