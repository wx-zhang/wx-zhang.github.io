{% for link in site.data.navigation.main %}
  {% if link.left %}
    <a class="normal left" href="{{ link.url }}">{{ link.title }}</a>
    {% else %}
    <a class="normal" href="{{ link.url }}">{{ link.title }}</a>
  {% endif %}
{% endfor %}

