class HTTPHandler
  # Does HTTP GET and retries while the response isn't nil.
  def http_get_with_retries(url, options, retries)
    response = nil
    tries = 0
    begin
      response = HTTParty.get(url, options)
      tries += 1
      if response.blank?
        sleep 1
      end
    end while response.blank? && tries < retries

    response
  end
end