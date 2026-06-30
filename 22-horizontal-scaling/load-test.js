import http from 'k6/http';

export const options = {
  vus: 100,
  duration: '5m',
};

export default function () {
  http.get('http://k8s-payment-paymenti-52efc2cb88-114421990.ap-south-1.elb.amazonaws.com/cpu');
}