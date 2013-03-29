# -*- coding: utf-8 -*-

from __future__ import with_statement
from functools import wraps

from werkzeug.exceptions import RequestEntityTooLarge
from flask import Flask, request, session, g, redirect, abort, json, jsonify

import xmltodict

# flask configuration
DEBUG      = True
SECRET_KEY = 'development key'
USERNAME   = 'admin'
PASSWORD   = 'default'
TOKEN_MAX_AGE = 30 * 24 * 3600

# create our little application :)
app = Flask(__name__)
app.config.from_object(__name__)
app.config.from_envvar('FLASKR_SETTINGS', silent=True)

## utils

def validate_post_fields(fields):
    for field in fields:
        if field not in request.form.keys():
            abort(400)

def validate_get_fields(fields):
    print request.args.keys()
    for field in fields:
        if field not in request.args.keys():
            abort(400)

import pycurl
import urllib
import StringIO

def dispatch(op, **args):
    url = 'http://202.116.64.108:8991/X'
    args['op'] = op
    print urllib.urlencode(args)

    ch = pycurl.Curl()
    ch.setopt(pycurl.URL, url + '?' + urllib.urlencode(args))
    ret = StringIO.StringIO()
    ch.setopt(pycurl.WRITEFUNCTION, ret.write)

    ch.perform()
    return ret.getvalue()

def requires_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.has_key('sno'):
            # flash(u'You need to be signed in for this page.')
            # return redirect(url_for('login', next=request.path))
            abort(403)
        return f(*args, **kwargs)
    return decorated_function

# register error handlers
@app.errorhandler(400)
def bad_request(error):
    return jsonify({ 'message': 'Bad Request' }), 400

@app.errorhandler(401)
def auth_failed(error):
    return jsonify({ 'message': 'Authentication Failed' }), 401

@app.errorhandler(403)
def session_expired(error):
    return jsonify({ 'message': 'Session Expired' }), 403

@app.errorhandler(408)
def request_timeout(error):
    return jsonify({ 'message': 'Request Timeout' }), 408

# GET /check/:card_id
#

@app.route('/signin', methods=['POST'])
def login():
    validate_post_fields(['sno', 'password'])
    sno, password = [request.form[x] for x in ['sno', 'password']]

    rv_xml = dispatch('bor-auth', bor_id=sno, verification=password,
                  user_name='ZSUNC', user_password='84037775')

    rv_dict = xmltodict.parse(rv_xml)['bor-auth']

    if 'error' in rv_dict:
        abort(401)
    else:
        # keep sno/id in session
        session['sno'] = sno
        session['id'] = rv_dict['z303']['z303-id']

        return jsonify(message='OK', info=rv_dict)

@app.route('/signout', methods=['POST'])
def logout():
    session.pop('sno', None)
    session.pop('id', None)

    return jsonify(message='OK')

@app.route('/info')
@requires_auth
def get_info():
    sno = session['sno']

    rv_xml = dispatch('bor_info_nlc', bor_id=sno, user_name='ZSUNC', user_password='84037775')

    rv_dict = xmltodict.parse(rv_xml)['bor-info-nlc']

    return jsonify(message='OK', info=rv_dict)

@app.route('/loan_books')
@requires_auth
def get_loan_books():
    sno = session['sno']
    print sno

    rv_xml = dispatch('bor-info', bor_id=sno, user_name='ZSUNC', user_password='84037775')

    rv_dict = xmltodict.parse(rv_xml)['bor-info']
    rv_dict = rv_dict.get('item-l')

    return jsonify(message='OK', books=rv_dict)

@app.route('/search_result_entry')
def get_search_result_entry():
    validate_get_fields(['name'])
    name = request.args['name']
    print name

    rv_xml = dispatch('find', code='wrd', request=name, base='zsu01',
            user_name='ZSUNC', user_password='84037775')

    rv_dict = xmltodict.parse(rv_xml)['find']

    return jsonify(message='OK', entry=rv_dict)


@app.route('/search_result')
def get_search_result():
    print request.args.keys()
    validate_get_fields(['set_number', 'set_entry' ])
    set_number = request.args['set_number']
    set_entry = request.args['set_entry']

    rv_xml = dispatch('present', set_number=set_number, set_entry=set_entry, base='zsu01',
            user_name='ZSUNC', user_password='84037775')

    print rv_xml
    rv_dict = xmltodict.parse(rv_xml)['present']['record']

    return json.dumps(rv_dict)

if __name__ == '__main__':
    app.run(host='0.0.0.0')