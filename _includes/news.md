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
  <li><strong style="color: #c13c33;">[Pinned to top]  I am actively seeking for full time position in 2026. I am happy to engage in discussions regarding potential opportunities!</strong></li>
  <li>[10/2025] I am awarded the KAUST Dean's List Award by my university!</li>
  <li>[09/2025] Our paper, Vgent, about long video understanding is accepted to NeurIPS '25 as spotlight presentation! </li>
  <li>[08/2025] Started my internship with Meta AI, working on alignment of LLM.</li>
  <li>[03/2025] Our ICLR '25 (spotlight) work <a href="https://arxiv.org/abs/2408.15313">BFPO</a> is out on arxiv! Please find our code <a href="https://github.com/wx-zhang/bfpo">here</a></li>
  <li>[02/2025] Our papers, <a href="https://arxiv.org/abs/2408.15313">BFPO</a> about safety alignment  and <a href="https://openreview.net/forum?id=XKv29sMyjF">QKT</a> about collabrative learning, are accepted in ICLR '25! See you in Singapore!</li>
  <li>[10/2024] Started my internship with Samsung Research America, woking on model merging.</li>
  <li>[06/2024] Our paper, <a href="https://arxiv.org/abs/2312.00923">IWMS (Label Delay in CL)</a>,  is accepted to NeurIPS '24! Code and applications are <a href="https://botcs.github.io/label-delay/">here </a> !</li>
  <li>[06/2024] Our paper, <a href="https://arxiv.org/abs/2308.12462">SPU</a>, is accepted to CVPR '24! Code and applications are <a href="https://wx-zhang.github.io/spu/html/">here</a>! </li>
  <li>[01/2024] One paper, DietCL, about constrained CL is accepted to ICLR '24!</li>
  <li>[07/2023] Started my internship at Oxford, working on safety alignment.</li>
  <li>[07/2023] One paper is accepted to ICCV '23!</li>
  <li>[04/2023] One paper is accepted to ICML'23!</li>
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