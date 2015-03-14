class StaticPagesController < ApplicationController
  def index
    @api_key = cookies[:api_key]
    @account_number = cookies[:account_number]
    @complete = @api_key && @account_number && @api_key != '' && @account_number != '' ? true : false;
  end

  def set_cookies
    cookies[:api_key] = {
        value: params[:api_key],
        expires: 1.week.from_now
    }

    cookies[:account_number] = {
        value: params[:account_number],
        expires: 1.week.from_now
    }

    render :nothing => true, :status => :ok
  end

  def delete_cookies
    cookies.delete(:api_key)
    cookies.delete(:account_number)

    render :nothing => true, :status => :ok
  end
end