<h1 id="publications"></h1>

<h2 style="margin: 60px 0px -15px;">Publications <temp style="font-size:15px;">[</temp><a href="https://scholar.google.com/citations?user=bOEvZ3MAAAAJ" target="_blank" style="font-size:15px;">Google Scholar</a><temp style="font-size:15px;">]</temp></h2>


<div class="publications">
<ol class="bibliography">

{% for link in site.data.publications.main %}

<li>
  <div class="pub-row">
    <div class="col-sm-3 abbr" style="position: relative;padding-right: 15px;padding-left: 15px;">
      {% if link.image %} 
      <img src="{{ link.image }}" class="teaser teaser-img img-fluid z-depth-1">
      {% endif %}
      {% if link.video %} 
      <video id="teaser" autoplay="" muted="" loop="" playsinline="" class="teaser z-depth-1" >
        <source src="{{ link.video }}" type="video/mp4">
      </video>
      {% endif %}
      {% if link.conference_short %} 
      <abbr class="badge">{{ link.conference_short }}</abbr>
      {% endif %}
      {% if link.is_oral %} 
      <abbr class="badge oral-badge">Oral</abbr>
      {% endif %}
      {% if link.is_preprint %} 
      <abbr class="badge preprint-badge">Preprint</abbr>
      {% endif %}
    </div>
    <div class="col-sm-9" style="position: relative;padding-right: 15px;padding-left: 20px;">
        <div class="title"><a href="{{ link.pdf }}">{{ link.title }}</a></div>
        <div class="author">{{ link.authors }}</div>
        <div class="periodical"><em>{{ link.conference }}</em>
        </div>
      <div class="links">
        {% if link.pdf %} 
        <a href="{{ link.pdf }}" class="btn btn-pdf btn-sm z-depth-0" role="button" target="_blank" style="font-size:12px;">
          <i class="fa-solid fa-file-pdf"></i> PDF
        </a>
        {% endif %}
        {% if link.code %} 
        <a href="{{ link.code }}" class="btn btn-code btn-sm z-depth-0" role="button" target="_blank" style="font-size:12px;">
          <i class="fa-brands fa-github"></i> Code
        </a>
        {% endif %}
        {% if link.page %} 
        <a href="{{ link.page }}" class="btn btn-ppage btn-sm z-depth-0" role="button" target="_blank" style="font-size:12px;">
          <i class="fas fa-mouse"></i> Project Page
        </a>
        {% endif %}
        {% if link.bibtex %} 
        <a href="{{ link.bibtex }}" class="btn btn-bibtex btn-sm z-depth-0" role="button" target="_blank" style="font-size:12px;">
          <i class="fas fa-book"></i> BibTeX
        </a>
        {% endif %}
        {% if link.notes %} 
        <strong> <i style="color:#ed8f87">{{ link.notes }}</i></strong>
        {% endif %}
        {% if link.others %} 
        {{ link.others }}
        {% endif %}
      </div>
    </div>
  </div>
</li>

<br>

{% endfor %}
</ol>
</div>


